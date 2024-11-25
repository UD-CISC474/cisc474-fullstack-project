import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import {
  queryTickers,
  TickerResponse,
} from '../../../../../backend/src/polygon';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarketService {
  constructor(private http: HttpClient) {}

  getTickers(date: string): Promise<TickerResponse> {
    return queryTickers(date);
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

  getCompanyData(ticker: string, from: string, to: string, interval: string): Observable<any> {
    const apiUrl = 'http://localhost:3000/api/company-data';
    const params = new HttpParams()
      .set('ticker', ticker)
      .set('from', from)
      .set('to', to)
      .set('interval', interval);
    return this.http.get(apiUrl, { params });
  }
  
}
