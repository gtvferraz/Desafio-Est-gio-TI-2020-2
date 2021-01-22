import React, { useEffect, useState } from 'react';

// components
import { Table, Button, Popup, Modal, Header, Icon, Form } from 'semantic-ui-react'

//services
import api from '../../services/api';

// styles
import { Container, InitialText } from './styles';

const Dashboard = () => {
  const [alunos, setAlunos] = useState([]); //LISTA DE TODOS OS ALUNOS
  const [currentInfo, setCurrentInfo] = useState([]); //ALUNO SELECIONADO EM UM DETERMINADA AÇÃO
  const [modalInfos, setModalInfos] = useState(false); //CONTROLE DO MODAL DE EDIÇÃO E CRIAÇÃO DE UM ALUNO
  const [modalTitle, setModalTitle] = useState(false); //TITULO DO MODAL, ASSUME UM VALOR PARA O MODAL DE EDIÇÃO DE ALUNO E OUTRO PARA O MODAL DE CRIAÇÃO DE ALUNO
  const [modalFunction, setModalFunction] = useState(false); //DETERMINA QUAL FUNÇÃO SERÁ CHAMADA NO BOTÃO SALVAR DO MODAL DE EDIÇÃO E CRIAÇÃO DE UM ALUNO. ASSUME VALOR 0 PARA EDIÇÃO E 1 PARA CRIAÇÃO
  const [modalAlunoCurso, setModalAlunoCurso] = useState(false); //CONTROLE DO MODAL DE ADICIONAR UM CURSO A UM ALUNO
  const [newCurso, setNewCurso] = useState([]); //CURSO A SER ADICIONADO
  const [cursos, setCursos] = useState([]); //LISTA DE CURSOS
  const [cepDisabled, setCepDisabled] = useState([]); //CASO O USUÁRIO TENHA DIGITADO O CEP, ESTA VARIÁVEL ASSUME VERDADEIRO E DESABILITA OS CAMPOS DE CIDADE E ESTADO


  useEffect(()=>{
    async function fetchData() {
      try{
        const response = await api.get('/alunos');
        setAlunos(response.data);
      } catch {
        alert('Confira a api');
      }
    }
    fetchData();
  }, [])

  //MODAL PARA EDIÇÃO E CRIAÇÃO DE ALUNOS
  const render_modal_info_alunos = () => (
    <Modal open={modalInfos} onClose={()=>setModalInfos(false)} closeIcon>
    <Header id="modal" content={modalTitle} />
    <Modal.Content>
      <Form>
        <Form.Group widths='equal'>
          <Form.Input fluid onChange={e => updateNewInfo('nome', e.target.value)} id="nome" label='Nome' placeholder='Nome' value={currentInfo.nome}/>
          <Form.Input fluid onChange={e => updateNewInfo('email', e.target.value)} id="email" label='Email' placeholder='Email' value={currentInfo.email}/>
          <Form.Input fluid onChange={e => updateCEP(e.target.value)} label='CEP' id="cep" placeholder='CEP' value={currentInfo.cep}/>
          <Form.Input fluid onChange={e => updateNewInfo('cidade', e.target.value)} id="cidade" label='Cidade' placeholder='Cidade' value={currentInfo.cidade} disabled={cepDisabled}/>
          <Form.Input fluid onChange={e => updateEstado(e.target.value)} id="estado" label='Estado' placeholder='Estado' value={currentInfo.estado} disabled={cepDisabled}/>
        </Form.Group>
      </Form>
    </Modal.Content>
    <Modal.Actions>
      <Button onClick={()=>setModalInfos(false)} color='red'>
        <Icon name='remove' /> Cancelar
      </Button>
      <Button onClick={()=>saveAluno()} color='green'>
        <Icon name='checkmark' /> Salvar
      </Button>
    </Modal.Actions>
  </Modal>
  )  
  
  //MODAL PARA ASSOCIAR UM ALUNO A UM CURSO
  const render_modal_aluno_curso = () => (
    <Modal open={modalAlunoCurso} onClose={()=>setModalAlunoCurso(false)} closeIcon>
    <Header content={`Adicionar um curso ao aluno ${currentInfo.nome}`} />
    <Modal.Content>
      <Form>
        <Form.Group widths='equal'>
          <Form.Select fluid onChange={(e, data)=>updateCurso(data)} id="curso" label='Curso' placeholder='Curso' options={cursos} />
        </Form.Group>
      </Form>
    </Modal.Content>
    <Modal.Actions>
      <Button onClick={()=>setModalAlunoCurso(false)} color='red'>
        <Icon name='remove' /> Cancelar
      </Button>
      <Button onClick={()=>associateAlunoCurso()} color='green'>
        <Icon name='checkmark' /> Salvar
      </Button>
    </Modal.Actions>
  </Modal>
  )

  //FUNÇÃO CHAMADA NO EVENTO ONCHANGE DO CAMPO CEP
  function updateCEP(valor) {
    updateNewInfo('cep', valor);

    if(valor.length == 9) { //MÁSCARA DE CEP
      valor = valor.substring(0,8);
      let aux = {...currentInfo};
      aux.cep = valor;
      setCurrentInfo(aux);
    } else if(valor.length == 8) {
      const url = "https://brasilapi.com.br/api/cep/v1/" + valor; //BRASILAPI UTILIZADA PARA CONSULTAR O CEP
      fetch(url).then((response) => {
        if(!response.ok) throw new Error(response.status);
        else return response.json();
      }).then(
        (result) => {
          const newAluno = {...currentInfo};
          newAluno.cep = valor;
          newAluno.estado = result.state;
          newAluno.cidade = result.city;
          setCurrentInfo(newAluno);
          
          document.getElementById('estado').value = newAluno.estado;
          document.getElementById('cidade').value = newAluno.cidade;

          //NÃO PERMITE QUE O USUÁRIO ALTERE O ESTADO OU A CIDADE PARA UM VALOR INVÁLIDO
          setCepDisabled(true);
        },
        (error) => {
          alert("CEP inexistente");
        }
      )
    } else {
      //CASO O USUÁRIO NÃO TENHA DIGITADO O CEP, HABILITA OS CAMPOS DE ESTADO E CIDADE PARA ALTERAÇÃO MANUAL
      setCepDisabled(false);
    }
  }

  //FUNÇÃO CHAMADA NO EVENTO ONCHANGE DO CAMPO ESTADO
  function updateEstado(valor) {
    updateNewInfo('estado', valor);
    if(valor.length == 3) { //MÁSCARA DE ESTADO
      valor = valor.substring(0,2);
      let aux = {...currentInfo};
      aux.estado = valor;
      setCurrentInfo(aux);
    }
  }

  ////FUNÇÃO CHAMADA NO EVENTO ONCHANGE DO SELECT DE CURSO
  function updateCurso(data) {
    setNewCurso(data.value);
  }

  //FUNÇÃO CHAMADA NOS EVENTOS ONCHANGE DOS CAMPOS REFERENTES A UM ALUNO
  function updateNewInfo(campo, valor) {
    //CASO O USUÁRIO DEIXE UM CAMPO EM BRANCO NO MODAL, O MESMO IRÁ ASSUMIR SEU VALOR PRÉVIO
    const newAluno = {id: currentInfo.id, nome: currentInfo.nome, email: currentInfo.email, cep: currentInfo.cep, cidade: currentInfo.cidade, estado: currentInfo.estado};
    switch(campo) {
      case 'nome': 
        newAluno.nome = valor; 
        setCurrentInfo(newAluno);
      break;
      case 'email': 
        newAluno.email = valor; 
        setCurrentInfo(newAluno);
      break;
      case 'cep': 
        newAluno.cep = valor; 
        setCurrentInfo(newAluno);
      break;
      case 'cidade': 
        newAluno.cidade = valor; 
        setCurrentInfo(newAluno);
      break;
      case 'estado': 
        newAluno.estado = valor; 
        setCurrentInfo(newAluno);
      break;
    }
    //setNewInfo(newAluno);
  }

  ////FUNÇÃO CHAMADA PARA O BOTÃO DE SALVAR NO MODAL DE EDIÇÃO E CRIAÇÃO DE UM ALUNO
  function saveAluno() {
    async function updateData() {
      try{
        const response = await api.put('/alunos', currentInfo);
        setAlunos(alunos.map((elemento) => {
          if(elemento.id == response.data.id)
            return {...response.data};
          else
            return elemento;
        }));
      } catch(error) {
        alert(error);
      }

      setModalInfos(false);
    }

    async function saveData() {
      try{
        const response = await api.post('/alunos', currentInfo);
        let aux = [...alunos];
        aux.push(response.data);
        setAlunos(aux);
      } catch(error) {
        alert(error);
      }

      setModalInfos(false);
    }

    if(currentInfo.nome == '') {
      alert("O campo nome é obrigatório");
      return;
    } else if(currentInfo.email == '') {
      alert("O campo email é obrigatório");
      return;
    } else if(currentInfo.cep == '') {
      alert("O campo cep é obrigatório");
      return;
    } else if(currentInfo.estado == '') {
      alert("O campo estado é obrigatório");
      return;
    } else if(currentInfo.cidade == '') {
      alert("O campo cidade é obrigatório");
      return;
    }

    if(modalFunction == 0)
      updateData();
    else
      saveData();
  }

  //FUNÇÃO CHAMADA NA AÇÃO DE DELETAR UM ALUNO
  function deleteAluno(data_aluno) {
    async function deleteData() {
      try{
        const response = await api.delete(`/alunos/${data_aluno.id}`);
        let aux = [...alunos];
        let index;
        for(var i=0; i<aux.length; i++)
          if(aux[i].id == response.data.id) {
            index = i;
            break;
          }
        aux.splice(index,1);
        setAlunos(aux);
      } catch(error) {
        alert(error);
      }
    }
    deleteData();
  }

  ////FUNÇÃO CHAMADA NO BOTÃO DE SALVAR DO MODAL DE ADICIONAR UM CURSO A UM ALUNO
  function associateAlunoCurso() {
    async function associateCurso() {
      try{
        await api.post('/curso_aluno', {id_pessoa: currentInfo.id, id_curso: newCurso});
      } catch(error) {
        alert("Curso já adicionado para este aluno");
      }
    }
    if(newCurso == undefined) {
      alert("Selecione um curso");
      return;
    }
    associateCurso();
    setModalAlunoCurso(false);
  }

  //FUNÇÃO CHAMADA NO BOTÃO DE ADICIONAR UM NOVO ALUNO 
  function open_info_new_aluno() {
    setCurrentInfo({id: '', nome: '', email: '', cidade: '', estado: ''});

    setModalTitle("Cadastrar um novo aluno");
    setModalFunction(1);
    setModalInfos(true);
    setCepDisabled(false);
  }

  ////FUNÇÃO CHAMADA NA AÇÃO DE EDITAR UM ALUNO
  function open_info_alunos(data_aluno) {
    setCurrentInfo(data_aluno);

    setModalTitle(`Editando informações de ${data_aluno.nome}`);
    setModalFunction(0);
    setModalInfos(true);

    if(data_aluno.cep.length == 8)
      setCepDisabled(true);
    else
      setCepDisabled(false);
  }

  ////FUNÇÃO CHAMADA NA AÇÃO DE ADICIONAR UM CURSO A UM ALUNO
  function open_aluno_curso(data_aluno) {
    setCurrentInfo(data_aluno);
    setModalAlunoCurso(true);
    setNewCurso(undefined);

    async function fetchData() {
      try{
        const response = await api.get('/cursos');

        //PREPARA O RESPONSE.DATA PARA PODER SER UTILIZADO PARA POPULAR O SELECT DE CURSOS
        response.data.forEach(element => {
          element["key"] = element["id"];
          element["value"] = element["id"];
          element["text"] = element["nome"];
        });
        setCursos(response.data);
      } catch(error) {
        alert(error);
      }
    }
    fetchData();
  }

  function render_actions(data_aluno){
    return <center>
      <Popup
        trigger={<Button icon='edit' onClick={()=>open_info_alunos(data_aluno)} />}
        content="Editar informações"
        basic
      />
      <Popup
        trigger={<Button icon='plus' positive onClick={() => open_aluno_curso(data_aluno)} />}
        content="Adicionar curso para aluno"
        basic
      />
      <Popup
        trigger={<Button icon='close' negative onClick={() => {
          if(window.confirm(`Tem certeza que deseja deletar o aluno ${data_aluno.nome}?`))
            deleteAluno(data_aluno);
          }
        } />}
        content="Excluir aluno"
        basic
      />
    </center>
  }

  function render_alunos(){
    return alunos.map((v)=><Table.Row key={v.id}>
      <Table.Cell>{v.id}</Table.Cell>
      <Table.Cell>{v.nome}</Table.Cell>
      <Table.Cell>{v.email}</Table.Cell>
      <Table.Cell>{v.cep}</Table.Cell>
      <Table.Cell>{v.estado}</Table.Cell>
      <Table.Cell>{v.cidade}</Table.Cell>
      <Table.Cell>{render_actions(v)}</Table.Cell>
    </Table.Row>)
  }

  return (
    <Container>
      <InitialText>Administrador de alunos</InitialText>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>ID Aluno</Table.HeaderCell>
            <Table.HeaderCell>Nome</Table.HeaderCell>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>CEP</Table.HeaderCell>
            <Table.HeaderCell>Cidade</Table.HeaderCell>
            <Table.HeaderCell>Estado</Table.HeaderCell>
            <Table.HeaderCell>Ações</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          { alunos.length > 0 ? render_alunos() : <Table.Row><Table.Cell><h2>Nenhum dado registrado </h2></Table.Cell></Table.Row> }
        </Table.Body>
      </Table>
      {render_modal_info_alunos()}
      {render_modal_aluno_curso()}
      <Button primary onClick={() => open_info_new_aluno()}>Adicionar aluno</Button>
      <Button href="/" secondary>Ver instruções</Button>
    </Container>
  );
};

export default Dashboard;
