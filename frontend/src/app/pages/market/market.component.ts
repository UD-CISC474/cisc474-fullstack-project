import { Component, OnInit } from '@angular/core';
import { MarketService } from './market.service';
import { NgFor, NgIf } from '@angular/common';
import dayjs from 'dayjs';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { CompanyResponse, SelectedTicker, Stock } from '../../interfaces';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  standalone: true,
  imports: [NgFor, FormsModule, NgIf, MatIcon],
})
export class MarketComponent implements OnInit {
  tickers: CompanyResponse[] = [];
  filteredTickers: CompanyResponse[] = [];
  searchQuery: string = '';
  selectedTicker: SelectedTicker | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 50;
  totalPages: number = 0;
  paginatedTickers: CompanyResponse[] = [];

  userId: string = 'default-user';
  amount: number = 1;
  purchaseMessage: string = '';
  sellMessage: string = '';

  constructor(private marketService: MarketService, private router: Router) {}

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
      const tickerResponse = await firstValueFrom(
        this.marketService.getTickers(date)
      );

      console.log('Full ticker response:', tickerResponse);

      const tickers = tickerResponse?.response?.results;

      if (tickers && Array.isArray(tickers) && tickers.length > 0) {
        this.tickers = tickers;

        this.selectedTicker = {
          T: this.tickers[0].ticker,
          c: this.tickers[0].prices[0].close,
          h: this.tickers[0].prices[0].high,
          l: this.tickers[0].prices[0].low,
          o: this.tickers[0].prices[0].open,
          t: this.tickers[0].prices[0].openTimestamp,
          uv: 0,
          us: 0,
        };

        await this.updateSelectedTickerValue();
        this.filterTickers();
      } else {
        console.warn('No tickers found in the response:', tickerResponse);
        this.tickers = [];
      }
    } catch (error) {
      console.error('Failed to load tickers', error);
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

  async buyStock(amount: number): Promise<void> {
    if (!this.selectedTicker || amount <= 0) {
      this.purchaseMessage = 'Please select a stock and enter a valid amount.';
      return;
    }

    if (!this.selectedTicker.c) {
      this.purchaseMessage = 'Selected ticker has no current price.';
      return;
    }

    const totalPrice = Number((amount * this.selectedTicker.c).toFixed(2));

    try {
      const currencyResponse: any = await firstValueFrom(
        this.marketService.getCurrency(this.userId)
      );
      const fetchedCurrency = currencyResponse.currency.currency;

      if (fetchedCurrency < totalPrice) {
        this.purchaseMessage = 'Insufficient funds to purchase the stock.';
        return;
      }

      const payload = {
        userId: this.userId,
        stockSymbol: this.selectedTicker.T,
        shares: amount,
        price: this.selectedTicker.c,
      };

      const purchaseResponse = await firstValueFrom(
        this.marketService.purchaseStock(payload)
      );
      console.log('Purchase Response:', purchaseResponse);

      const newCurrencyBalance = fetchedCurrency - totalPrice;

      const updateResponse = await firstValueFrom(
        this.marketService.updateCurrency({
          userId: this.userId,
          currency: newCurrencyBalance,
        })
      );
      console.log('Currency Update Response:', updateResponse);

      await this.updateSelectedTickerValue();
      this.purchaseMessage = `Successfully purchased ${amount} shares of ${this.selectedTicker.t}!`;
    } catch (error) {
      this.purchaseMessage = 'Failed to purchase stock. Please try again.';
      console.error('Purchase Error:', error);
    }
  }

  getStocks(): Promise<any> {
    return lastValueFrom(this.marketService.getUserStocks(this.userId));
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
    if (!this.selectedTicker || amount <= 0) {
      this.sellMessage = 'Please select a stock and enter a valid amount.';
      return;
    }

    if (!this.selectedTicker.c) {
      this.sellMessage = 'Selected ticker has no current price.';
      return;
    }

    const totalPrice = Number((amount * this.selectedTicker.c).toFixed(2));

    try {
      const response = await firstValueFrom(
        this.marketService.getUserStocks(this.userId)
      );
      const userStocks: { [key: string]: Stock } = response.stocks || {};

      const userStocksArray = Object.entries(userStocks).map(([id, stock]) => ({
        id,
        stock,
      }));

      const stockToSell = userStocksArray.find(
        ({ stock }) =>
          stock.stockSymbol === this.selectedTicker!.T &&
          stock.price === this.selectedTicker!.c
      );

      if (!stockToSell) {
        this.sellMessage = 'You do not own this stock at the specified price.';
        return;
      }

      if (stockToSell.stock.shares < amount) {
        this.sellMessage = 'You do not have enough shares to sell.';
        return;
      }

      const updatedShares = stockToSell.stock.shares - amount;

      const payload = {
        userId: this.userId,
        stockSymbol: this.selectedTicker!.T,
        shares: updatedShares,
        price: this.selectedTicker!.c,
        stockId: stockToSell.id,
      };

      await firstValueFrom(this.marketService.updateUserStocks(payload));

      const currencyResponse: any = await firstValueFrom(
        this.marketService.getCurrency(this.userId)
      );
      const fetchedCurrency = currencyResponse.currency.currency;
      const newCurrencyBalance = fetchedCurrency + totalPrice;

      await firstValueFrom(
        this.marketService.updateCurrency({
          userId: this.userId,
          currency: newCurrencyBalance,
        })
      );

      await this.updateSelectedTickerValue();
      this.sellMessage = `Successfully sold ${amount} shares of ${this.selectedTicker.T}!`;
    } catch (error) {
      this.sellMessage = 'Failed to sell stock. Please try again.';
      console.error('Sell Error:', error);
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

  async selectTicker(ticker: CompanyResponse): Promise<void> {
    this.selectedTicker = {
      T: ticker.ticker,
      c: ticker.prices[0].close,
      h: ticker.prices[0].high,
      l: ticker.prices[0].low,
      o: ticker.prices[0].open,
      t: ticker.prices[0].openTimestamp,
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
      ticker.ticker.toLowerCase().includes(query)
    );
    this.currentPage = 1;
    this.updatePagination();
  }
}
