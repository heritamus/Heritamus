import * as express from 'express';

import GraphCtrl from './controllers/graph';
import Neo4jCtrl from './controllers/neo4j';
import RequestCtrl from './controllers/request';
import TypeCtrl from './controllers/type';
import UserCtrl from './controllers/user';

export default function setRoutes(app) {

  const router = express.Router();

  const graphCtrl = new GraphCtrl();
  const neo4jCtrl = new Neo4jCtrl();
  const requestCtrl = new RequestCtrl();
  const typeCtrl = new TypeCtrl();
  const userCtrl = new UserCtrl();

  router.route('/login').post(userCtrl.login);

  router.route('/neo4j/allnodes').get(neo4jCtrl.getAllNodes);
  router.route('/neo4j/mostusednodes').get(neo4jCtrl.getMostCommonlyUsedNodes);
  router.route('/neo4j/count-nodes').get(neo4jCtrl.countNodes);
  router.route('/neo4j/count-relations').get(neo4jCtrl.countRelations);
  router.route('/neo4j/graph').post(neo4jCtrl.saveGraph);
  router.route('/neo4j/graph/full/:rev_id/:uuid').get(neo4jCtrl.getFullGraph);
  router.route('/neo4j/graph/general/:dos/:name/:type').get(neo4jCtrl.getGeneralGraph);
  router.route('/neo4j/graph/:rev_id/:uuid/:limit').get(neo4jCtrl.getGraph);
  router.route('/neo4j/node/:rev_id/:name/:type/:uuid').get(neo4jCtrl.getSpecificNode);
  router.route('/neo4j/node/:name/:type').delete(neo4jCtrl.deleteNode);
  router.route('/neo4j/graph/:rev_id/:uuid').delete(neo4jCtrl.deleteGraph);

  router.route('/graphs').post(graphCtrl.insert);
  router.route('/graphs/:id').delete(graphCtrl.delete);
  router.route('/graphs/:id').put(graphCtrl.update);
  router.route('/graphs/unreviewed').get(graphCtrl.getNotReviewedGraphs);
  router.route('/graphs/getAllBelongsUser/:user').post(graphCtrl.getAllBelongsUser);

  router.route('/request').post(requestCtrl.insert);
  router.route('/requests').get(requestCtrl.getAll);
  router.route('/requests/count').get(requestCtrl.count);
  router.route('/request/:id').get(requestCtrl.get);
  router.route('/request/:id').delete(requestCtrl.delete);
  router.route('/request/:id').put(requestCtrl.update);
  router.route('/request/play').post(requestCtrl.play);

  router.route('/users').get(userCtrl.getAll);
  router.route('/users/count').get(userCtrl.count);
  router.route('/user').post(userCtrl.insert);
  router.route('/user/:id').get(userCtrl.get);
  router.route('/user/:id').put(userCtrl.updateProtected);
  router.route('/user/:id').delete(userCtrl.deleteProtected);

  router.route('/types').get(typeCtrl.getAll);
  router.route('/types/count').get(typeCtrl.count);
  router.route('/type').post(typeCtrl.insert);
  router.route('/type/:id').put(typeCtrl.update);
  router.route('/type/:id').delete(typeCtrl.delete);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);

}
