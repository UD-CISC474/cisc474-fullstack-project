import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MarketService } from '../market/market.service';
import { DashboardService } from './dashboard.service';
import dayjs from 'dayjs';
import { CompanyResponse, Stock } from '../../interfaces';
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
  selectedTicker: CompanyResponse = {
    successful: true,
    ticker: '',
    count: 0,
    start: new Date(),
    end: new Date(),
    prices: [
      {
        average: 0,
        close: 0,
        high: 0,
        low: 0,
        open: 0,
        openTimestamp: 0,
      },
    ],
  };
  searchQuery: string = '';
  userId: string = '';
  sessionToken: string = '';
  amount: number = 1;
  yesterday: string = '';
  stocks: CompanyResponse[] = [];
  nasdaqValue: number = 0;
  spValue: number = 0;
  dowValue: number = 0;
  portfolioValue: number = 0;
  recentNews: { title: string, content: string }[] = [
    { title: 'Loading...', content: 'Loading...' },
    { title: 'Loading...', content: 'Loading...' },
    { title: 'Loading...', content: 'Loading...' },
    { title: 'Loading...', content: 'Loading...' }
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

    this.fetchPopularStocks();
    this.getNewsFromOpenAI();
  }

  async fetchPopularStocks(): Promise<void> {
    const tickers = ['AAPL', 'MSFT', 'GOOG', 'AMZN'];

    for (const ticker of tickers) {
      const stockData = await this.searchTicker(ticker, this.yesterday);
      if (stockData) {
        this.stocks.push(stockData);
      }
    }
  }

  async searchTicker(ticker: string, startDate: string): Promise<CompanyResponse | null> {
    try {
      const url = `http://localhost:3000/api/stock/${ticker}/${startDate}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const stockData = await response.json();
      if (stockData.successful) {
        return stockData;
      } else {
        console.warn(`Data for ${ticker} was not successful:`, stockData);
        return null;
      }
    } catch (err) {
      console.error('Error fetching stock data:', err);
      return null;
    }
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
            'Give me some news on 4 trending stocks. Inbetween each news entry, put this character |. Do not use any markdown features or numbering. Give short title of the news with : before the news start',
        },
      ],
    });

    const response = completion.choices[0].message.content;
    let responseAsArray = response?.split('|');
    this.recentNews = responseAsArray?.map((value) => {
      const temp = value.split(':');
      return {
        title: temp[0],
        content: temp[1]
      };
    }) || [];

    // console.log(responseAsArray)

    // if (responseAsArray) {
    //   this.recentNews = recentNews;
    // }
  }
}
