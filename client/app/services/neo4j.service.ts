import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Graph } from '../shared/models/graph.model';

@Injectable()
export class Neo4jService {

  constructor(private http: HttpClient) {
  }

  getAllNodes(): Observable<any> {
    return this.http.get<any>(`/api/neo4j/allnodes`);
  }

  getMostCommonlyUsedNodes(): Observable<any> {
    return this.http.get<any>(`/api/neo4j/mostusednodes`);
  }

  getNumberOfNodes(): Observable<number> {
    return this.http.get<any>(`/api/neo4j/count-nodes`);
  }

  getNumberOfRelations(): Observable<number> {
    return this.http.get<any>(`/api/neo4j/count-relations`);
  }

  getGeneralGraph(name: string, type: string, dos: number = 3): Observable<any> {
    return this.http.get<any>(`/api/neo4j/graph/general/${dos}/${name}/${type}`);
  }

  getFullGraph(rev_id: number, uuid: string): Observable<any> {
    return this.http.get<any>(`/api/neo4j/graph/full/${rev_id}/${uuid}`);
  }

  getGraph(rev_id: number, uuid: string, limit: number = 10): Observable<any> {
    return this.http.get<any>(`/api/neo4j/graph/${rev_id}/${uuid}/${limit}`);
  }

  saveGraph(req: string): Observable<any> {
    let request = { 'req': req };
    return this.http.post<any>(`/api/neo4j/graph`, request);
  }

  getSpecificNode(name: string, type: string): Observable<any> {
    let rev_id = 0;
    let uuid = 'default';
    return this.http.get<any>(`/api/neo4j/node/${rev_id}/${name}/${type}/${uuid}`);
  }

  deleteNode(name: string, type: string): Observable<any> {
    return this.http.delete(`/api/neo4j/node/${name}/${type}`);
  }

  deleteGraph(g: Graph): Observable<any> {
    return this.http.delete(`/api/neo4j/graph/${g.revision}/${g.uuid}`);
  }
}
