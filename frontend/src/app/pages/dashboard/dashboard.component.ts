import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MarketService } from '../market/market.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import dayjs from 'dayjs';
import { Stock } from '../../interfaces';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatGridListModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  userId: string = 'default-user';
  portfolioValue: number = 0;
  recentNews: string[] = ['NEWS', 'NEWS', 'NEWS', 'NEWS'];

  constructor(
    private auth: Auth,
    private marketService: MarketService,
    private router: Router
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

  ngOnInit(): void {
    let yesterday: string;
    if (dayjs().day().toString() === 'Monday') {
      yesterday = dayjs().subtract(3, 'day').format('YYYY-MM-DD');
    } else {
      yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    }
  }

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
