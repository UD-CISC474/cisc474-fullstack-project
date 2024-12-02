import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getIndices(date: string): Observable<any> {
    const params = new HttpParams().set('date', date);
    const apiUrl = 'http://localhost:3000/api/index';
    return this.http.get(apiUrl, { params });
  }
}
