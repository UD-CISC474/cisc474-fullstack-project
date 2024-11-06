import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  queryTickers,
  TickerResponse,
} from '../../../../../backend/src/polygon';

@Injectable({
  providedIn: 'root',
})
export class MarketService {
  constructor(private http: HttpClient) {}

  getTickers(date: string): Promise<TickerResponse> {
    return queryTickers(date);
  }
}
