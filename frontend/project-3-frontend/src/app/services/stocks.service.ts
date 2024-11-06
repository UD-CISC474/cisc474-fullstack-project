// stocks.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CompanyQueryParams {
    ticker: string;
    from?: string;
    to?: string;
    interval?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StocksService {

  constructor(private http: HttpClient) {}

  // Function to query data for a single stock
  queryCompanyData(params: CompanyQueryParams): Observable<any> {
    const { ticker, from, to, interval } = params;
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/${interval}/${from}/${to}`;

    return this.http.get(url).pipe(
      catchError(error => {
        console.error("Error fetching stock data", error);
        return of(null);
      })
    );
  }

  // Function to get data for multiple stocks (e.g., top 10)
  getTopStocks(): Observable<any[]> {
    const topStockTickers = ["AAPL", "GOOG", "AMZN", "MSFT", "TSLA", "NVDA", "META", "BABA", "NFLX", "INTC"];
    const requests = topStockTickers.map(ticker =>
      this.queryCompanyData({ ticker, interval: 'day' })
    );

    return of(requests); // Observable of array of requests
  }
}
