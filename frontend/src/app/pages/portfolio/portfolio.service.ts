import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private portfolioValueSubject = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  getUserStocks(userId: string): Observable<any> {
    const apiUrl = 'http://localhost:3000/api/portfolio';
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const username = userId;
    const body = { username };

    return this.http.post(apiUrl, body, { headers }).pipe(
      tap(
        (response) => {
          console.log('User portfolio:', response);
        },
        (error) => {
          console.error('Error fetching portfolio:', error);
        }
      )
    );
  }

  get portfolioValue$() {
    return this.portfolioValueSubject.asObservable();
  }

  setPortfolioValue(value: number): void {
    this.portfolioValueSubject.next(value);
  }
}
