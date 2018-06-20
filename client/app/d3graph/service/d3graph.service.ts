import {Injectable} from '@angular/core';
import {D3Node} from '../models/d3node.model';

@Injectable()
export class D3graphService {
  private _legend: D3Node[];

  constructor() {
    this._legend = [];
  }
  get legend() {
    return this._legend;
  }
}
