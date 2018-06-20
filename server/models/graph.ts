import * as mongoose from 'mongoose';

const graphSchema = new mongoose.Schema({
  user: String,
  name: String,
  uuid: String,
  created: Date,
  revision: Number,
  state: String,
  comment: String
});

const Graph = mongoose.model('Graph', graphSchema);

export default Graph;
