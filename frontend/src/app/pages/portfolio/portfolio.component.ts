import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { MarketService } from '../market/market.service';
import { PortfolioService } from './portfolio.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Stock, Transaction } from '../../interfaces';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule], // Import CommonModule for Angular directives like *ngFor and *ngIf
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
})
export class PortfolioComponent {
  userId: string = 'default-user';
  portfolioValue: number = 0;
  transactions: Transaction[] = [];
  availableCoins = 10000;
  gainLoss = 2000;
  holdings: Stock[] = [];

  constructor(
    private auth: Auth,
    private marketService: MarketService,
    private router: Router,
    private portfolioService: PortfolioService
  ) {
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        this.userId = user.uid;
        console.log(`Authenticated user: ${this.userId}`);
        this.getPortfolioValue();
        this.loadTransactions(this.userId);
        this.marketService.getUserStocks(this.userId);
        this.loadHoldings(this.userId);
      } else {
        this.router.navigate(['/profile']);
        console.log('No user authenticated. Using default-user.');
      }
    });
  }

  async loadHoldings(userId: string): Promise<void> {
    let response = await firstValueFrom(
      this.portfolioService.getUserStocks(this.userId)
    );
    const stocksArray: Transaction[] = Object.values(response.stocks);

    // Create a Map to aggregate stocks by their symbol
    const stockMap = new Map<string, { shares: number; totalValue: number }>();

    stocksArray.forEach((value) => {
      const roundedPrice = Number(value.price.toFixed(2));
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

    // Convert the aggregated Map to an array
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
  }

  async loadTransactions(userId: string): Promise<void> {
    let response = await firstValueFrom(
      this.portfolioService.getUserStocks(this.userId)
    );
    const stocksArray: Transaction[] = Object.values(response.stocks);
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
  }

  async getPortfolioValue(): Promise<void> {
    console.log(this.userId);
    const response = await lastValueFrom(
      this.marketService.getUserStocks(this.userId)
    );

    const userStocks: { [key: string]: Transaction } = response.stocks;
    const userStocksArray: { id: string; stock: Transaction }[] =
      Object.entries(userStocks).map(([id, stock]) => ({
        id,
        stock,
      }));

    let totalValue = 0;
    if (userStocksArray && userStocksArray.length > 0) {
      userStocksArray.map(({ stock }) => {
        totalValue += stock.price * stock.shares;
      });
    }

    this.portfolioValue = Number(totalValue.toFixed(2));
    console.log(this.portfolioValue);
  }
}
