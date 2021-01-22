import Aluno from '../models/Aluno';
import CursoAluno from '../models/CursoAluno';

class AlunoController {
  async index(req, res) {
    const alunos = await Aluno.findAll()
    res.json(alunos);
  }

  async read(req, res) {
    // TODO
  }

  async create(req, res) {
    const novo = req.body;
    try {
      let aluno = await Aluno.create(novo);
      res.json(aluno);
    }catch(erro) {
      console.log(erro);
      return res.status(400).json({
        error: erro
      });
    }
  }

  async update(req, res) {
    const novo = req.body;
    try {
      let aluno = await Aluno.findByPk(novo.id);
      aluno.update(novo);

      res.json(aluno);
    }catch(erro) {
      console.log(erro);
      return res.status(400).json({
        error: erro
      });
    }
  }

  async delete(req, res) {
    const novo = req.params;
    try {
      let aluno = await Aluno.findByPk(novo.id);
      aluno.destroy();

      //DELETA TODAS OS REGISTROS DA TABELA curso_pessoa PARA O ALUNO DELETADO
      let cursos_aluno = await CursoAluno.findAll();
      cursos_aluno.forEach(element => {
        if(element.id_pessoa == aluno.id)
          element.destroy();
      });

      res.json(aluno);
    }catch(erro) {
      console.log(erro);
      return res.status(400).json({
        error: erro
      });
    }
  }
}

export default new AlunoController();