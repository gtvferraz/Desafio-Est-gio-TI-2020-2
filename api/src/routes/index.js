import { Router } from 'express';

/** Controllers */
import AlunosController from '../app/controllers/AlunoController';
import CursoController from '../app/controllers/CursoController';
import CursoAlunoController from '../app/controllers/CursoAlunoController';
/**  * */

const routes = new Router();

routes.get('/alunos', AlunosController.index);
routes.put('/alunos', AlunosController.update);
routes.post('/alunos', AlunosController.create);
routes.delete('/alunos/:id', AlunosController.delete);

routes.get('/cursos', CursoController.index);

routes.post('/curso_aluno', CursoAlunoController.create);

export default routes;
