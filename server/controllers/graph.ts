import Graph from '../models/graph';
import BaseCtrl from './base';

export default class GraphCtrl extends BaseCtrl {
  model = Graph;

  getAllBelongsUser = (req, res) => {
    this.model.find({user: req.params.user }, (err, docs) => {
      if (err) { return console.error(err); }
      res.status(200).json(docs);
    });
  }

  getNotReviewedGraphs = (req, res) => {
    this.model.find({state: 'published'}, (err, docs) => {
      if (err) { return console.error(err); }
      res.status(200).json(docs);
    });
  }
}
