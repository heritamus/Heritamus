import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Graph } from '../shared/models/graph.model';
import { User } from '../shared/models/user.model';

@Injectable()
export class GraphService {
  graphIDEmitter: EventEmitter<number>;
  graphOpenEmitter: EventEmitter<boolean>;


  constructor(private http: HttpClient) {
    this.graphIDEmitter = new EventEmitter<number>();
    this.graphOpenEmitter = new EventEmitter<boolean>();
  }

  getGraphs(user: User): Observable<Graph[]> {
    return this.http.post<Graph[]>(`/api/graphs/getAllBelongsUser/${user._id}`, null);
  }

  getNotReviewedGraphs(): Observable<Graph[]> {
    return this.http.get<Graph[]>(`/api/graphs/unreviewed`);
  }

  addGraph(graph: Graph): Observable<Graph> {
    return this.http.post<Graph>(`/api/graphs`, graph);
  }

  editGraph(graph: Graph): Observable<Graph> {
    return this.http.put<Graph>(`/api/graphs/${graph._id}`, graph);
  }

  deleteGraph(graph: Graph): Observable<string> {
    return this.http.delete(`/api/graphs/${graph._id}`, { responseType: 'text' });
  }

}
