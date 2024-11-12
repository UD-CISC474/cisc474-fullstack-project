import { Component, OnInit } from '@angular/core';
import { MarketService } from './market.service';
import { TickerResult } from '../../../../../backend/src/polygon';
import { NgFor } from '@angular/common';
import dayjs from 'dayjs';
import { Y } from '@angular/cdk/keycodes';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  standalone: true,
  imports: [NgFor,FormsModule],
})
export class MarketComponent implements OnInit {
  tickers: TickerResult[] = [];
  filteredTickers: TickerResult[] = [];
  searchQuery: string = ''; // Bind to search input
  selectedTicker: TickerResult | null = null;

  constructor(private marketService: MarketService) {}

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
      const tickerResponse = await this.marketService.getTickers(date);
      this.tickers = tickerResponse.results;
      this.filteredTickers = this.tickers; // Initialize filteredTickers
    } catch (error) {
      console.error(`Failed to load tickers`, error);
      this.tickers = [];
      this.filteredTickers = [];
    }
  }

  selectTicker(ticker: TickerResult): void {
    this.selectedTicker = ticker;
  }

  filterTickers(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredTickers = this.tickers.filter(ticker =>
      ticker.T.toLowerCase().includes(query)
    );
  }
}
