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

  ngOnInit(): void {
    this.loadTickers();
  }

  async loadTickers(): Promise<void> {
    try {
      this.tickers = (await this.marketService.getTickers()).results;
    } catch (error) {
      console.error(`Failed to load tickers`, error);
      this.tickers = [];
    }
  }

  selectTicker(ticker: TickerResult): void {
    this.selectedTicker = ticker;
  }
}
