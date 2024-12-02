import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarketService {
  constructor(private http: HttpClient) {}

  getTickers(date: string): Observable<any> {
    const params = new HttpParams().set('date', date);
    const apiUrl = 'http://localhost:3000/api/stock';
    return this.http.get(apiUrl, { params });
  }

  purchaseStock(payload: {
    userId: string;
    stockSymbol: string;
    shares: number;
    price: number;
  }): Observable<any> {
    const apiUrl = 'http://localhost:3000/api/user/stock';
    return this.http.post(apiUrl, payload);
  }

  getUserStocks(userId: string): Observable<any> {
    const apiUrl = 'http://localhost:3000/api/user/stock';
    const params = new HttpParams().set('userId', userId);
    return this.http.get(apiUrl, { params });
  }

  updateUserStocks(payload: {
    userId: string;
    stockSymbol: string;
    shares: number;
    price: number;
    stockId: string;
  }): Observable<any> {
    console.log('Payload being sent to backend:', payload);
    const apiUrl = 'http://localhost:3000/api/user/stock';
    return this.http.put(apiUrl, payload);
  }

  getCurrency(userId: string) {
    const apiUrl = 'http://localhost:3000/api/user';
    const params = new HttpParams().set('userId', userId);
    return this.http.get(apiUrl, { params });
  }

  updateCurrency(payload: {
    userId: string;
    currency: number;
  }): Observable<any> {
    console.log('testing post currency');
    const apiUrl = 'http://localhost:3000/api/user';
    return this.http.put(apiUrl, payload);
  }
}
