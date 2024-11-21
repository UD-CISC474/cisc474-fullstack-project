import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule], // Import CommonModule for Angular directives like *ngFor and *ngIf
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
})
export class PortfolioComponent {
  portfolioValue = 50000; // Total value of portfolio
  availableCash = 10000; // Available cash for trading
  gainLoss = 2000; // Total gain/loss

  holdings = [
    { symbol: 'AAPL', shares: 10, price: 150, value: 1500, change: 0.02 },
    { symbol: 'TSLA', shares: 5, price: 700, value: 3500, change: -0.01 },
    { symbol: 'AMZN', shares: 2, price: 3200, value: 6400, change: 0.03 },
  ];

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
}
