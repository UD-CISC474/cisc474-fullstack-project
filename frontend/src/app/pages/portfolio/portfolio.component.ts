import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { MarketService } from '../market/market.service';
import { PortfolioService } from './portfolio.service';
import { Router } from '@angular/router';
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
  //transactions: Transaction[] = [];
  availableCoins: number = 0;
  gainLoss = 0;
  //holdings: Stock[] = [];

  constructor(
    private marketService: MarketService,
    private router: Router,
    private portfolioService: PortfolioService
  ) {
  }

  // async getPortfolioValue(): Promise<void> {
  //   try {
  //     const response = await firstValueFrom(
  //       this.marketService.getUserStocks(this.userId)
  //     );

  //     const userStocks: { [key: string]: Transaction } = response.stocks || {};
  //     const userStocksArray = Object.values(userStocks);

  //     let totalValue = 0;
  //     if (userStocksArray && userStocksArray.length > 0) {
  //       userStocksArray.forEach((stock) => {
  //         totalValue += stock.price * stock.shares;
  //       });
  //     }

  //     this.portfolioValue = Number(totalValue.toFixed(2));
  //     console.log(`Portfolio Value: ${this.portfolioValue}`);
  //   } catch (error) {
  //     console.error('Failed to fetch portfolio value:', error);
  //     this.portfolioValue = 0;
  //   }
  // }
}
