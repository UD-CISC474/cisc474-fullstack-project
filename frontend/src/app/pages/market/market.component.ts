import { Component, OnInit } from '@angular/core';
import { MarketService } from './market.service';
import { TickerResult } from '../../../../../backend/src/polygon';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  standalone: true,
  imports: [NgFor],
})
export class MarketComponent implements OnInit {
  tickers: TickerResult[] = [];
  selectedTicker: TickerResult | null = null; // To store the selected ticker

  constructor(private marketService: MarketService) {}

  // using yesterdays date until we can figure out a way to get up to date stock info
  ngOnInit(): void {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = yesterday.toISOString().split('T')[0];
    this.loadTickers(formattedDate);
  }

  async loadTickers(date: string): Promise<void> {
    try {
      this.tickers = (await this.marketService.getTickers(date)).results;
    } catch (error) {
      console.error(`Failed to load tickers`, error);
      this.tickers = [];
    }
  }

  selectTicker(ticker: TickerResult): void {
    this.selectedTicker = ticker;
  }
}
