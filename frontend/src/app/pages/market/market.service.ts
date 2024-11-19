import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
}
