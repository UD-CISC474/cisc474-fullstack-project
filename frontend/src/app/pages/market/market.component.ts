import { Component, OnInit } from '@angular/core';
import { MarketService } from './market.service';
import { NgFor, NgIf } from '@angular/common';
import dayjs from 'dayjs';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { CompanyResponse } from '../../interfaces';
import { Router } from '@angular/router';
import { GraphComponent } from '../../components/graph/graph.component';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  standalone: true,
  imports: [NgFor, FormsModule, MatIcon, GraphComponent],
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

    if (dayjs().day().toString() === '1') {
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
    let startDate = this.yesterday;
    if (period === '5D') {
      startDate = dayjs().subtract(5, 'day').format('YYYY-MM-DD');
    } else if (period === '1M') {
      startDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD')
    } else if (period === '6M') {
      startDate = dayjs().subtract(180, 'day').format('YYYY-MM-DD');
    } else if (period === '1Y') {
      startDate = dayjs().subtract(365, 'day').format('YYYY-MM-DD');
    } else if (period === '2Y') {
      startDate = dayjs().subtract(730, 'day').format('YYYY-MM-DD');
    }

    this.searchTicker(this.selectedTicker.ticker, startDate)
      .then((updatedStock) => {
        if (updatedStock) {
          this.selectedTicker = { ...updatedStock };
        }
      })
      .catch((err) => {
        console.error('Failed to update graph period:', err);
      });
  }

  async buyStock(amount: number) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.sessionToken);

    const payload = {
      username: this.userId,
      ticker: this.selectedTicker.ticker,
      price: this.selectedTicker.prices[0].close,
      amount: amount,
    };

    const buyResponse = await fetch('http://localhost:3000/api/buy', {
      headers,
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await buyResponse.json();
    console.log(data);
    if (data.message === 'Stock purchase successful.') {
      const totalPrice = Number(
        this.selectedTicker.prices[0].close * amount
      ).toFixed(2);
      console.log(
        `Success! Bought ${amount} shares of ${this.selectedTicker.ticker} for ${totalPrice} Super Trader Coins!`
      );
    } else {
      console.log("Error: couldn't buy stock.");
    }
  }

  async sellStock(amount: number) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.sessionToken);

    const payload = {
      username: this.userId,
      ticker: this.selectedTicker.ticker,
      price: this.selectedTicker.prices[0].close,
      amount: amount,
    };

    const sellResponse = await fetch('http://localhost:3000/api/sell', {
      headers,
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await sellResponse.json();

    if (data.message === 'Stock sale successful.') {
      const totalPrice = Number(
        this.selectedTicker.prices[0].close * amount
      ).toFixed(2);
      console.log(
        `Success! Sold ${amount} shares of ${this.selectedTicker.ticker} for ${totalPrice} Super Trader Coins!`
      );
    } else {
      console.log("Error: couldn't sell stock.");
    }
  }

  async searchTicker(
    ticker: string,
    startDate = this.yesterday
  ): Promise<CompanyResponse | null> {
    try {
      const url = `http://localhost:3000/api/stock/${ticker}/${startDate}`;
      const response = await fetch(url);
      const stockData = await response.json();
      if (stockData.successful) {
        this.stocks = [stockData];
        return stockData;
      }
      return null;
    } catch (err) {
      console.error('Error fetching stock data:', err);
      return null;
    }
  }

  selectTicker(ticker: CompanyResponse): void {
    this.selectedTicker = { ...ticker };
    console.log('Selected Ticker:', this.selectedTicker);
  }

  clearStocks(query: string) {
    if (query === '') {
      this.stocks = [];
    }
  }
}
