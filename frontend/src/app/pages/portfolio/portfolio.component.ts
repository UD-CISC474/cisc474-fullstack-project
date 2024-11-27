import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { MarketService } from '../market/market.service';
import { PortfolioService } from './portfolio.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Stock, StocksResponse } from '../../interfaces';

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
  transactions: Stock[] = [];
  availableCash = 10000; // Available cash for trading
  gainLoss = 2000; // Total gain/loss
  holdings = [
    { symbol: 'AAPL', shares: 10, price: 150, value: 1500, change: 0.02 },
    { symbol: 'TSLA', shares: 5, price: 700, value: 3500, change: -0.01 },
    { symbol: 'AMZN', shares: 2, price: 3200, value: 6400, change: 0.03 },
  ];

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
      } else {
        this.router.navigate(['/profile']);
        console.log('No user authenticated. Using default-user.');
      }
    });
  }

  async loadTransactions(userId: string): Promise<void> {
    let response = await firstValueFrom(
      this.portfolioService.getUserStocks(this.userId)
    );
    const stocksArray: Stock[] = Object.values(response.stocks);
    const preProcessedTransactions = stocksArray.map((value) => {
      const roundedPrice = Number(value.price.toFixed(2));
      const roundedTotal = Number((value.shares * value.price).toFixed(2));
      const newValue: Stock = {
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

    const userStocks: { [key: string]: Stock } = response.stocks;
    const userStocksArray: { id: string; stock: Stock }[] = Object.entries(
      userStocks
    ).map(([id, stock]) => ({
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
