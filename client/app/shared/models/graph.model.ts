import { User } from './user.model';

export class Graph {
  _id?: string;
  user?: string;
  name?: string;
  uuid?: string;
  created?: Date;
  revision?: number;
  state?: string;
  comment?: string;
}
