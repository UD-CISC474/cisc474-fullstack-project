import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { MarketService } from '../market/market.service';
import { PortfolioService } from './portfolio.service';
import { Router } from '@angular/router';
import { Stock, Transaction } from '../../interfaces';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
})
export class PortfolioComponent {
  userId: string = '';
  sessionToken: string = '';
  portfolioValue: number = 0;
  transactions: Transaction[] = [];
  availableCoins: number = 0;
  gainLoss = 0;
  holdings: Stock[] = [];

  constructor(
    private marketService: MarketService,
    private router: Router,
    private portfolioService: PortfolioService
  ) {
    // this.getPortfolioValue();
    // this.loadTransactions();
    // this.loadHoldings();
    // this.loadAvailableCoins();
  }

  ngOnInit(): void {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    if (username && token) {
      this.userId = username;
      this.sessionToken = token;
    }
    this.getPortfolioValue();
    this.loadTransactions();
    this.loadHoldings();
    // this.loadAvailableCoins();
  }

  async loadAvailableCoins(): Promise<void> {
    try {
      const response: any = await firstValueFrom(
        this.marketService.getCurrency(this.userId)
      );

      this.availableCoins = Number(response.currency.currency.toFixed(2));
      console.log(`Available coins: ${this.availableCoins}`);
    } catch (error) {
      console.error('Failed to fetch available coins:', error);
      this.availableCoins = 0;
    }
  }

  async loadHoldings(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.portfolioService.getUserStocks(this.userId)
      );
      if (!response.holdings.stocks) {
        return;
      }
      const stocksArray: any[] = Object.values(response.holdings.stocks || {});

      const stocksMapped: Transaction[] = stocksArray.map((value) => {
        const price = value.currentSharePrice || 0;
        const shares = value.numberOfShares || 0;
        const stockSymbol = value.ticker || '';
        const total = (price * shares).toFixed(2);
        const timestamp = new Date().toISOString().slice(0, 10); 
  
        return {
          price,
          shares,
          stockSymbol,
          timestamp,
          total: Number(total),
        };
      });

      const stockMap = new Map<
        string,
        { shares: number; totalValue: number }
      >();

      stocksMapped.forEach((value) => {
        const roundedTotal = Number((value.shares * value.price).toFixed(2));

        if (stockMap.has(value.stockSymbol)) {
          const stockData = stockMap.get(value.stockSymbol)!;
          stockData.shares += value.shares;
          stockData.totalValue += roundedTotal;
        } else {
          stockMap.set(value.stockSymbol, {
            shares: value.shares,
            totalValue: roundedTotal,
          });
        }
      });

      const preProcessedTransactions: Stock[] = Array.from(
        stockMap.entries()
      ).map(([stockSymbol, data]) => {
        const averagePrice = Number((data.totalValue / data.shares).toFixed(2));
        return {
          stockSymbol,
          shares: data.shares,
          price: averagePrice,
          total: Number(data.totalValue.toFixed(2)),
          change: 0,
        };
      });

      this.holdings = preProcessedTransactions.reverse();
    } catch (error) {
      console.error('Failed to load holdings:', error);
      this.holdings = [];
    }
  }

  async loadTransactions(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.portfolioService.getUserStocks(this.userId)
      );
      const stocksArray: any[] = Object.values(response.holdings.stocks || {});
      const stocksMapped: Transaction[] = stocksArray.map((value) => {
        const price = value.currentSharePrice || 0;
        const shares = value.numberOfShares || 0;
        const stockSymbol = value.ticker || '';
        const total = (price * shares).toFixed(2);
        const timestamp = new Date().toISOString().slice(0, 10); 
  
        return {
          price,
          shares,
          stockSymbol,
          timestamp,
          total: Number(total),
        };
      });

      const preProcessedTransactions = stocksMapped.map((value) => {
        const roundedPrice = Number(value.price.toFixed(2));
        const roundedTotal = Number((value.shares * value.price).toFixed(2));
        const newValue: Transaction = {
          stockSymbol: value.stockSymbol,
          shares: value.shares,
          price: roundedPrice,
          timestamp: value.timestamp.slice(0, 10),
          total: roundedTotal,
        };
        return newValue;
      });

      this.transactions = preProcessedTransactions.reverse();
    } catch (error) {
      console.error('Failed to load transactions:', error);
      this.transactions = [];
    }
  }

  async getPortfolioValue(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.marketService.getUserStocks(this.userId)
      );

      const userStocks: { [key: string]: any } = response.holdings.stocks || {};
      const userStocksArray = Object.values(userStocks);

      const stocksMapped: Transaction[] = userStocksArray.map((value) => {
        const price = value.currentSharePrice || 0;
        const shares = value.numberOfShares || 0;
        const stockSymbol = value.ticker || '';
        const total = (price * shares).toFixed(2);
        const timestamp = new Date().toISOString().slice(0, 10); 
  
        return {
          price,
          shares,
          stockSymbol,
          timestamp,
          total: Number(total),
        };
      });


      let totalValue = 0;
      if (stocksMapped && stocksMapped.length > 0) {
        stocksMapped.forEach((stock) => {
          totalValue += stock.price * stock.shares;
        });
      }

      this.portfolioValue = Number(totalValue.toFixed(2));
      this.portfolioService.setPortfolioValue(totalValue);
    } catch (error) {
      console.error('Failed to fetch portfolio value:', error);
      this.portfolioValue = 0;
    }
  }
}