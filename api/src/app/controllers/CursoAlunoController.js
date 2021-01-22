import CursoAluno from '../models/CursoAluno';

class CursoAlunoController {
  async create(req, res) {
    const novo = req.body;
    try {
      //VERIFICA SE O CURSO JÁ NÃO ESTÁ ASSOCIADO AO ALUNO
      let aluno_curso = await CursoAluno.findAll();
      for(var i=0; i<aluno_curso.length; i++) {
        let element = aluno_curso[i];
        if(element.id_pessoa == novo.id_pessoa && element.id_curso == novo.id_curso) {
          return res.status(400).json({
            error: "Curso já adicionado para este aluno"
          });
        }
      }

      aluno_curso = await CursoAluno.create(novo);
      res.json(aluno_curso);
    }catch(erro) {
      console.log(erro);
      return res.status(400).json({
        error: erro
      });
    }
  }
}

export default new CursoAlunoController();