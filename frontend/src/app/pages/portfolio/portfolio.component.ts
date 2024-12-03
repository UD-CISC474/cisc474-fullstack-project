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
  userId: string = 'default-user';
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
      const stocksArray: Transaction[] = Object.values(response.stocks || {});

      const stockMap = new Map<
        string,
        { shares: number; totalValue: number }
      >();

      stocksArray.forEach((value) => {
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
      const stocksArray: Transaction[] = Object.values(response.stocks || {});

      const preProcessedTransactions = stocksArray.map((value) => {
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

      const userStocks: { [key: string]: Transaction } = response.stocks || {};
      const userStocksArray = Object.values(userStocks);

      let totalValue = 0;
      if (userStocksArray && userStocksArray.length > 0) {
        userStocksArray.forEach((stock) => {
          totalValue += stock.price * stock.shares;
        });
      }

      this.portfolioValue = Number(totalValue.toFixed(2));
      console.log(`Portfolio Value: ${this.portfolioValue}`);
    } catch (error) {
      console.error('Failed to fetch portfolio value:', error);
      this.portfolioValue = 0;
    }
  }
}
