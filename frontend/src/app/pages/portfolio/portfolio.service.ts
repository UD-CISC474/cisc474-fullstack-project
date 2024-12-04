import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  constructor(private http: HttpClient) {}

  getUserStocks(userId: string): Observable<any> {
    const apiUrl = 'http://localhost:3000/api/user/stock';
    const params = new HttpParams().set('userId', userId);
    return this.http.get(apiUrl, { params });
  }
}
