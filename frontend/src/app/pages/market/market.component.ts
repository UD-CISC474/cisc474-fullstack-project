import { Component, OnInit } from '@angular/core';
import { MarketService } from './market.service';
import { TickerResult } from '../../../../../backend/src/polygon';
import { NgFor } from '@angular/common';
import dayjs from 'dayjs';
import { Y } from '@angular/cdk/keycodes';

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
    let yesterday: string;
    if (dayjs().day().toString() === 'Monday') {
      yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    } else {
      yesterday = dayjs().subtract(3, 'day').format('YYYY-MM-DD');
    }
    this.loadTickers(yesterday);
  }

  async loadTickers(date: string): Promise<void> {
    try {
      this.tickers = (await this.marketService.getTickers(date)).results;
      console.log(this.tickers);
    } catch (error) {
      console.error(`Failed to load tickers`, error);
      this.tickers = [];
    }
  }

  selectTicker(ticker: TickerResult): void {
    this.selectedTicker = ticker;
  }
}
