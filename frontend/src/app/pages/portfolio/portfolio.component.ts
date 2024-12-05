import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { PortfolioService } from './portfolio.service';
import { Router } from '@angular/router';
import { Stock, Transaction } from '../../interfaces';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../../../../environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
})
export class PortfolioComponent {
  userId: string = '';
  sessionToken: string = '';
  portfolioValue: number = 0;
  transactions: Transaction[] = [];
  availableCoins: number = 0;
  gainLoss = 0;
  holdings: Stock[] = [];
  feedback: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit(): void {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    if (username && token) {
      this.userId = username;
      this.sessionToken = token;
      this.loadPortfolioData();
    }
  }

  async loadPortfolioData(): Promise<void> {
    try {
      console.log('Session Token:', this.sessionToken);

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `${this.sessionToken}`,
      });

      const response = await firstValueFrom(
        this.http.post<any>(
          'http://localhost:3000/api/portfolio',
          { username: this.userId },
          { headers }
        )
      );

      if (response.success) {
        this.availableCoins = response.availableCash;
        this.transactions = response.transactions;
        this.holdings = response.holdings;
        this.portfolioValue = this.holdings.reduce(
          (acc, holding) => acc + holding.total,
          this.availableCoins
        );
        this.generateFeedback();
      } else {
        console.error('Failed to load portfolio data:', response.message);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    }
  }

  async generateFeedback() {
    try {
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const holdingsSummary = this.holdings
        .map(
          (holding) =>
            `Ticker: ${holding.stockSymbol}, Shares: ${holding.shares}, Average Price: ${holding.price}`
        )
        .join('; ');

      const prompt = `
        I have a user portfolio with the following details:
        - Current cash: ${this.availableCoins} USD
        - Portfolio value: ${this.portfolioValue} USD
        - Holdings: ${holdingsSummary}
        Can you provide a brief analysis of this portfolio, along with any suggestions or feedback?
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an experienced investment advisor.',
          },
          { role: 'user', content: prompt },
        ],
      });

      const response = completion.choices[0].message.content;
      this.feedback = response || 'No feedback available at the moment.';
    } catch (error) {
      console.error('Error generating feedback from OpenAI:', error);
      this.feedback = 'Failed to generate feedback.';
    }
  }

  async loadAvailableCoins(): Promise<void> {
    try {
      const response: any = await firstValueFrom(
        this.portfolioService.getCurrency(this.userId)
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
}

