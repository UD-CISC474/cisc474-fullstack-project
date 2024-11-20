import { Component, OnInit } from '@angular/core';
import { MarketService } from './market.service';
import { TickerResult } from '../../../../../backend/src/polygon';
import { NgFor, NgIf } from '@angular/common';
import dayjs from 'dayjs';
import { FormsModule } from '@angular/forms';
import { getAuth, onAuthStateChanged, user, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { MatIcon } from '@angular/material/icon';

interface Stock {
  stockSymbol: string;
  shares: number;
  price: number;
}
interface SelectedTicker {
  T: string; // Ticker symbol
  c: number; // Close price
  h: number; // High price
  l: number; // Low price
  n: number; // Number of trades
  o: number; // Open price
  t: number; // Timestamp
  v: number; // Volume
  vw: number; // Volume weighted average price
  uv: number; // total user value owned in this stock
  us: number; // total shares owned by user
}
@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  standalone: true,
  imports: [NgFor, FormsModule, NgIf, MatIcon],
})
export class MarketComponent implements OnInit {
  tickers: TickerResult[] = [];
  filteredTickers: TickerResult[] = [];
  searchQuery: string = '';
  selectedTicker: SelectedTicker | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 50;
  totalPages: number = 0;
  paginatedTickers: TickerResult[] = [];

  userId: string = 'default-user';
  amount: number = 1;
  purchaseMessage: string = '';
  sellMessage: string = '';
  constructor(private marketService: MarketService) {}

  ngOnInit(): void {
    console.log(this.userId);
    let yesterday: string;
    if (dayjs().day().toString() === 'Monday') {
      yesterday = dayjs().subtract(3, 'day').format('YYYY-MM-DD');
    } else {
      yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    }

    this.loadTickers(yesterday);

    const auth = getAuth();

    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        this.userId = user.uid;
        console.log(`Authenticated user: ${this.userId}`);
      } else {
        console.log('No user authenticated. Using default-user.');
      }
    });
  }

  async loadTickers(date: string): Promise<void> {
    try {
      const tickerResponse = await this.marketService.getTickers(date);
      this.tickers = tickerResponse.results;
      this.selectedTicker = {
        T: this.tickers[0].T,
        c: this.tickers[0].c,
        h: this.tickers[0].h,
        l: this.tickers[0].l,
        n: this.tickers[0].n,
        o: this.tickers[0].o,
        t: this.tickers[0].t,
        v: this.tickers[0].v,
        vw: this.tickers[0].vw,
        uv: 0,
        us: 0,
      };
      await this.updateSelectedTickerValue();
      this.filterTickers();
    } catch (error) {
      console.error(`Failed to load tickers`, error);
      this.tickers = [];
      this.filteredTickers = [];
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

  buyStock(amount: number): void {
    if (!this.selectedTicker || amount <= 0) {
      this.purchaseMessage = 'Please select a stock and enter a valid amount.';
      return;
    }

    const payload = {
      userId: this.userId,
      stockSymbol: this.selectedTicker.T,
      shares: amount,
      price: this.selectedTicker.c,
    };

    this.marketService.purchaseStock(payload).subscribe({
      next: async (response) => {
        await this.updateSelectedTickerValue();
        this.purchaseMessage = `Successfully purchased ${amount} shares of ${this.selectedTicker?.T}!`;
        console.log('Purchase Response:', response);
      },
      error: (error) => {
        this.purchaseMessage = 'Failed to purchase stock. Try again.';
        console.error('Purchase Error:', error);
      },
    });
  }

  getStocks(): Promise<any> {
    return this.marketService.getUserStocks(this.userId).toPromise();
  }

  async getUserStock() {
    try {
      const response = await this.getStocks();
      const userStocks: { [key: string]: Stock } = response.stocks;

      const userStocksArray: { id: string; stock: Stock }[] = Object.entries(
        userStocks
      ).map(([id, stock]) => ({
        id,
        stock,
      }));

      let totalValue = 0;
      let totalShares = 0;
      if (userStocksArray && userStocksArray.length > 0) {
        const stocks = userStocksArray.filter(
          ({ stock }) => stock.stockSymbol === this.selectedTicker?.T
        );
        stocks.map(({ stock }) => {
          totalValue += stock.price * stock.shares;
          totalShares += stock.shares;
        });
      }
      return [Number(totalValue.toFixed(2)), totalShares];
    } catch (error) {
      console.error('Error fetching stocks:', error);
      return [0, 0];
    }
  }

  async sellStock(amount: number): Promise<void> {
    try {
      const response = await this.getStocks();
      const userStocks: { [key: string]: Stock } = response.stocks;

      const userStocksArray: { id: string; stock: Stock }[] = Object.entries(
        userStocks
      ).map(([id, stock]) => ({
        id,
        stock,
      }));

      if (userStocksArray && userStocksArray.length > 0) {
        const stockToSell = userStocksArray.find(
          ({ stock }) =>
            stock.stockSymbol === this.selectedTicker?.T &&
            stock.price === this.selectedTicker?.c &&
            amount <= stock.shares
        );

        if (stockToSell) {
          console.log(
            `Selling ${amount} shares of ${stockToSell.stock.stockSymbol}`
          );

          const payload = {
            userId: this.userId,
            stockSymbol: this.selectedTicker!.T,
            shares: stockToSell.stock.shares - amount,
            price: this.selectedTicker!.c,
            stockId: stockToSell.id,
          };

          this.marketService.updateUserStocks(payload).subscribe({
            next: async (response) => {
              await this.updateSelectedTickerValue();
              this.sellMessage = `Successfully sold ${amount} shares of ${this.selectedTicker?.T}!`;
              console.log('Update successful:', response);
            },
            error: (error) => {
              this.sellMessage = 'Failed to sell stock. Try again.';
              console.error('Error updating stock:', error);
            },
          });
        } else {
          console.log('Selected stock not found in user holdings');
          this.sellMessage = 'Selected stock not found in user holdings.';
        }
      } else {
        console.log('No stocks found in user holdings');
        this.sellMessage = 'No stocks found in user holdings.';
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
      this.sellMessage = 'Error fetching stocks. Please try again.';
    }
  }

  async updateSelectedTickerValue(): Promise<void> {
    if (this.selectedTicker) {
      const totals = await this.getUserStock();
      this.selectedTicker.uv = totals[0];
      this.selectedTicker.us = totals[1];
    }
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(
      this.filteredTickers.length / this.itemsPerPage
    );
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

  async selectTicker(ticker: TickerResult): Promise<void> {
    this.selectedTicker = {
      T: ticker.T,
      c: ticker.c,
      h: ticker.h,
      l: ticker.l,
      n: ticker.n,
      o: ticker.o,
      t: ticker.t,
      v: ticker.v,
      vw: ticker.vw,
      uv: 0,
      us: 0,
    };
    const totals = await this.getUserStock();
    this.selectedTicker.uv = totals[0];
    this.selectedTicker.us = totals[1];
    this.amount = 1;
  }

  filterTickers(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredTickers = this.tickers.filter((ticker) =>
      ticker.T.toLowerCase().includes(query)
    );
    this.currentPage = 1;
    this.updatePagination();
  }
}
