// market.component.ts
import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import dayjs from 'dayjs';
import { FormsModule } from '@angular/forms';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { MatIcon } from '@angular/material/icon';
import {StockResponse } from '../../interfaces';
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
  filteredTickers: StockResponse[] = [];
  searchQuery: string = '';
  selectedTicker: StockResponse | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 50;
  totalPages: number = 0;
  paginatedTickers: StockResponse[] = [];

  userId: string = 'default-user';
  amount: number = 1;
  purchaseMessage: string = '';
  sellMessage: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log(this.userId);
    let yesterday: string;
    if (dayjs().day().toString() === 'Monday') {
      yesterday = dayjs().subtract(3, 'day').format('YYYY-MM-DD');
    } else {
      yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    }

    this.loadTickers(yesterday);
  }

  async loadTickers(date: string): Promise<void> {
    try {
      const response = await fetch(`http://localhost:3000/api/tickers?date=${date}`);
      const tickerResponse = await response.json();
      console.log('Full ticker response:', tickerResponse);

      this.tickers = tickerResponse?.response?.results || [];
      this.filterTickers();
    } catch (error) {
      console.error('Failed to load tickers', error);
      this.tickers = [];
      this.filteredTickers = [];
    }
  }

  filterTickers(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredTickers = this.tickers.filter((ticker) =>
      ticker.ticker.toLowerCase().includes(query)
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTickers.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTickers = this.filteredTickers.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
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


  // async getStock(ticker: string, start?: Date, end?: Date): Promise<StockResponse> {
  //   let url = `http://localhost:3000/api/stock/${ticker}`;
  //   if(typeof start !== undefined) {
  //     url = `${url}/${start.toISOString().substring(0, 10)}`;
  //   }
  //   if(typeof end !== undefined) {
  //     url = `${url}/${end.toISOString().substring(0, 10)}`;
  //   }
  
  //   const response: StockResponse = await fetch(url).then(res => res.json());
  //   return response;
  // }

  async getStock(ticker: string, start?: Date, end?: Date): Promise<StockResponse> {
    let url = `http://localhost:3000/api/stock/${ticker}`;
    if (start) {
      url = `${url}/${start.toISOString().substring(0, 10)}`;
    }
    if (end) {
      url = `${url}/${end.toISOString().substring(0, 10)}`;
    }
  
    const response: StockResponse = await fetch(url).then(res => res.json());
    return response;
  }
  
  
  async getPortfolio(username: string, token: string): Promise<any> {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", token);
  
    const response = await fetch("http://localhost:3000/api/portfolio", {
        headers,
        method: "POST",
        body: JSON.stringify({ username })
    }).then(res => res.json());
  
    return response;
  }  
}
