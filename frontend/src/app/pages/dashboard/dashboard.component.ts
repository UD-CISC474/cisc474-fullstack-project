import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MarketService } from '../market/market.service';
import { DashboardService } from './dashboard.service';
import dayjs from 'dayjs';
import { Stock } from '../../interfaces';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../../../../environment';
import { PortfolioService } from '../portfolio/portfolio.service';

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
  recentNews: string[] = [
    'Loading...',
    'Loading...',
    'Loading...',
    'Loading...',
  ];

  constructor(
    private marketService: MarketService,
    private router: Router,
    private dashboardService: DashboardService,
    private portfolioService: PortfolioService
  ) {
    // this.getPortfolioValue();
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

    this.portfolioService.portfolioValue$.subscribe((value) => {
      this.portfolioValue = value;
    });

    this.getNewsFromOpenAI();
  }

  async getNewsFromOpenAI() {
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a stock broker.' },
        {
          role: 'user',
          content:
            'Give me some news on 4 trending stocks. Inbetween each news entry, put this character |. Do not use any markdown features or numbering.',
        },
      ],
    });

    const response = completion.choices[0].message.content;
    let responseAsArray = response?.split('|');

    if (responseAsArray) {
      this.recentNews = responseAsArray;
    }

    console.log(responseAsArray)
  }
}
