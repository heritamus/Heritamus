import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Request } from '../shared/models/request.model';

@Injectable()
export class RequestService {

  constructor(private http: HttpClient) { }

  getRequests(): Observable<Request[]> {
    return this.http.get<Request[]>('/api/requests');
  }

  countRequest(): Observable<number> {
    return this.http.get<number>('/api/requests/count');
  }

  addRequest(request: Request): Observable<Request> {
    return this.http.post<Request>('/api/request', request);
  }

  editRequest(request: Request): Observable<Request> {
    return this.http.put<Request>(`/api/request/${request._id}`, request);
  }

  getRequest(request: Request): Observable<Request> {
    return this.http.get<Request>(`/api/request/${request._id}`);
  }

  deleteRequest(request: Request): Observable<string> {
    return this.http.delete(`/api/request/${request._id}`, { responseType: 'text' });
  }

  playRequest(request: Request): Observable<any> {
    return this.http.post<any>(`/api/request/play`, request);
  }

}
