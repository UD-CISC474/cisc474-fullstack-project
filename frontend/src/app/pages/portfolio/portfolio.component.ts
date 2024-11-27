import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { MarketService } from '../market/market.service';
import { PortfolioService } from './portfolio.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Stock } from '../../interfaces';

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
      } else {
        this.router.navigate(['/profile']);
        console.log('No user authenticated. Using default-user.');
      }
    });
  }

  transactions = [
    {
      date: new Date(),
      symbol: 'AAPL',
      type: 'Buy',
      shares: 10,
      price: 150,
      total: 1500,
    },
    {
      date: new Date(),
      symbol: 'TSLA',
      type: 'Sell',
      shares: 5,
      price: 700,
      total: 3500,
    },
  ];

  async getPortfolioValue(): Promise<void> {
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
  }
}
