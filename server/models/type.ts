import * as mongoose from 'mongoose';

const typeSchema = new mongoose.Schema({
  name: String,
  availability: String,
  state: String
});

const Request = mongoose.model('Type', typeSchema);

export default Request;
