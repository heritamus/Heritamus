import * as mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  name: String,
  request: String,
  help: String
});

const Request = mongoose.model('Request', requestSchema);

export default Request;
