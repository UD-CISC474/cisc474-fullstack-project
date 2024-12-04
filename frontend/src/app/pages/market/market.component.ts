import { Component, OnInit } from '@angular/core';
import { MarketService } from './market.service';
import { NgFor, NgIf } from '@angular/common';
import dayjs from 'dayjs';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { CompanyResponse } from '../../interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  standalone: true,
  imports: [NgFor, FormsModule, MatIcon],
})
export class MarketComponent implements OnInit {
  selectedTicker: CompanyResponse = {
    successful: true,
    ticker: '',
    count: 0,
    start: new Date(),
    end: new Date(),
    prices: [
      {
        average: 0,
        close: 0,
        high: 0,
        low: 0,
        open: 0,
        openTimestamp: 0,
      },
    ],
  };
  searchQuery: string = '';
  userId: string = '';
  sessionToken: string = '';
  amount: number = 1;
  yesterday: string = '';
  stocks: CompanyResponse[] = [];

  constructor(private marketService: MarketService, private router: Router) {}

  ngOnInit(): void {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    if (username && token) {
      this.userId = username;
      this.sessionToken = token;
    }

    if (dayjs().day().toString() === 'Monday') {
      this.yesterday = dayjs().subtract(3, 'day').format('YYYY-MM-DD');
    } else {
      this.yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    }
  }

  increaseAmount(): void {
    this.amount++;
  }

  decreaseAmount(): void {
    if (this.amount > 1) {
      this.amount--;
    }
  }

  updateGraphPeriod(period: string): void {
    console.log(`Graph updated for period: ${period}`);
    // Placeholder for graph update
  }

  buyStock(amount: number) {
    throw new Error('Method not implemented.');
  }

  sellStock(amount: number) {
    throw new Error('Method not implemented.');
  }

  async searchTicker(ticker: string) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const response = await fetch(
      `http://localhost:3000/api/stock/${ticker}/${this.yesterday}`
    );

    const stockData = await response.json();

    if (stockData.successful) {
      this.stocks = [stockData];
    }
    console.log(stockData);
  }

  selectTicker(ticker: CompanyResponse): void {
    this.selectedTicker = ticker; // Set the selected stock
    console.log('Selected Ticker:', this.selectedTicker);
  }

  clearStocks(query: string) {
    if (query === '') {
      this.stocks = [];
    }
  }
}
