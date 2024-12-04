// market.component.ts
import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import dayjs from 'dayjs';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { StockResponse } from '../../interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  standalone: true,
  imports: [NgFor, FormsModule, NgIf, MatIcon],
})
export class MarketComponent implements OnInit {
  tickers: StockResponse[] = [];
  searchQuery: string = '';
  selectedTicker: StockResponse | null = null;
  amount: number = 1;
  purchaseMessage: string = '';
  sellMessage: string = '';

  // Hardcoded popular stocks
  popularStocks: string[] = ['AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA'];

  userId: string = 'default-user';

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log(this.userId);
    this.loadPopularStocks();
  }

  // Load hardcoded popular stocks
  async loadPopularStocks(): Promise<void> {
    try {
      const requests = this.popularStocks.map((ticker) =>
        this.getStock(ticker).catch((error) => {
          console.error(`Failed to load data for ticker ${ticker}`, error);
          return null;
        })
      );

      const responses = await Promise.all(requests);
      this.tickers = responses.filter((data) => data !== null) as StockResponse[];
    } catch (error) {
      console.error('Failed to load popular stocks', error);
    }
  }

  async searchStock(): Promise<void> {
    if (this.searchQuery.trim() === '') {
      console.error('Please enter a valid ticker symbol');
      return;
    }

    try {
      const response = await this.getStock(this.searchQuery.trim().toUpperCase());
      this.selectedTicker = response;
    } catch (error) {
      console.error('Failed to find the stock', error);
      this.selectedTicker = null;
    }
  }

  async getStock(ticker: string, start?: Date, end?: Date): Promise<StockResponse> {
    let url = `http://localhost:3000/api/stock/${ticker}`;
    if (start) {
      url = `${url}/${start.toISOString().substring(0, 10)}`;
    }
    if (end) {
      url = `${url}/${end.toISOString().substring(0, 10)}`;
    }

    const response: StockResponse = await fetch(url).then((res) => res.json());
    return response;
  }

  selectTicker(ticker: StockResponse): void {
    this.selectedTicker = ticker;
    this.amount = 1;
  }

  increaseAmount(): void {
    this.amount++;
  }

  decreaseAmount(): void {
    if (this.amount > 1) {
      this.amount--;
    }
  }

  buyStock(amount: number): void {
    if (!this.selectedTicker) {
      console.error('No stock selected.');
      return;
    }

    console.log(`Buying ${amount} shares of ${this.selectedTicker.ticker}`);
    // Add logic for buying stock here
  }

  sellStock(amount: number): void {
    if (!this.selectedTicker) {
      console.error('No stock selected.');
      return;
    }

    console.log(`Selling ${amount} shares of ${this.selectedTicker.ticker}`);
    // Add logic for selling stock here
  }

  updateGraphPeriod(period: string): void {
    console.log(`Graph updated for period: ${period}`);
    // Placeholder for graph update
  }
}
