import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Type } from '../shared/models/type.model';

@Injectable()
export class TypesService {

  constructor(private http: HttpClient) { }

  getTypes(): Observable<Type[]> {
    return this.http.get<Type[]>('/api/types');
  }

  countTypes(): Observable<number> {
    return this.http.get<number>('/api/types/count');
  }

  addType(type: Type): Observable<Type> {
    return this.http.post<Type>('/api/type', type);
  }

  editType(type: Type): Observable<Type> {
    return this.http.put<Type>(`/api/type/${type._id}`, type);
  }

  deleteType(type: Type): Observable<string> {
    return this.http.delete(`/api/type/${type._id}`, { responseType: 'text' });
  }

}
