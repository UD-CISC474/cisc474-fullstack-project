import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MarketService } from '../market/market.service';
import { DashboardService } from './dashboard.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import dayjs from 'dayjs';
import { Stock } from '../../interfaces';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatGridListModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  userId: string = '';
  sessionToken = '';
  nasdaqValue: number = 0;
  spValue: number = 0;
  dowValue: number = 0;
  portfolioValue: number = 0;
  recentNews: string[] = ['NEWS', 'NEWS', 'NEWS', 'NEWS'];

  constructor(
    private auth: Auth,
    private marketService: MarketService,
    private router: Router,
    private dashboardService: DashboardService
  ) {
    //this.getPortfolioValue();
  }

  ngOnInit(): void {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    if (username && token) {
      this.userId = username;
      this.sessionToken = token;
    }
    let yesterday: string;
    if (dayjs().day().toString() === 'Monday') {
      yesterday = dayjs().subtract(3, 'day').format('YYYY-MM-DD');
    } else {
      yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    }

    // this.getIndicesValue(yesterday);
  }

  // async getIndicesValue(date: string): Promise<void> {
  //   const apiResponse = await lastValueFrom(
  //     this.dashboardService.getIndices(date)
  //   );

  //   if (apiResponse.success && apiResponse.response) {
  //     const response = apiResponse.response;
  //     this.nasdaqValue = Number(Number(response.nasdaq?.close).toFixed(2));
  //   } else {
  //     console.error('Failed to fetch indices data:', apiResponse.message);
  //   }
  // }

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
