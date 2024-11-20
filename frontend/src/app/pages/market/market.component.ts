import { Component, OnInit } from '@angular/core';
import { MarketService } from './market.service';
import { TickerResult } from '../../../../../backend/src/polygon';
import { NgFor, NgIf } from '@angular/common';
import dayjs from 'dayjs';
import { FormsModule } from '@angular/forms';
import { getAuth, onAuthStateChanged, User } from '@angular/fire/auth';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  standalone: true,
  imports: [NgFor, FormsModule, NgIf],
})
export class MarketComponent implements OnInit {
  tickers: TickerResult[] = [];
  filteredTickers: TickerResult[] = [];
  searchQuery: string = '';
  selectedTicker: TickerResult | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 50;
  totalPages: number = 0;
  paginatedTickers: TickerResult[] = [];

  userId: string = 'default-user'; // Placeholder for user ID
  amount: number = 1;
  purchaseMessage: string = '';
  sellMessage: string = '';

  constructor(private marketService: MarketService) {}

  ngOnInit(): void {
    let yesterday: string;
    if (dayjs().day().toString() === 'Monday') {
      yesterday = dayjs().subtract(3, 'day').format('YYYY-MM-DD');
    } else {
      yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    }

    this.loadTickers(yesterday);

    const auth = getAuth();

    // Listen for authentication state changes
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        this.userId = user.uid; // Set authenticated user ID
        console.log(`Authenticated user: ${this.userId}`);
      } else {
        console.log('No user authenticated. Using default-user.');
      }
    });
  }

  async loadTickers(date: string): Promise<void> {
    try {
      const tickerResponse = await this.marketService.getTickers(date);
      this.tickers = tickerResponse.results;
      this.selectedTicker = this.tickers[0];
      this.filterTickers();
    } catch (error) {
      console.error(`Failed to load tickers`, error);
      this.tickers = [];
      this.filteredTickers = [];
    }
  }

  increaseAmount(): void {
    this.amount++;
  }

  decreaseAmount(): void {
    if (this.amount > 1) {
      this.amount--;
    }
  }

  updateGraphPeriod(period: string): void {
    console.log(`Graph updated for period: ${period}`);
    // Placeholder for graph update
  }

  buyStock(amount: number): void {
    if (!this.selectedTicker || amount <= 0) {
      this.purchaseMessage = 'Please select a stock and enter a valid amount.';
      return;
    }

    const payload = {
      userId: this.userId,
      stockSymbol: this.selectedTicker.T,
      shares: amount,
      price: this.selectedTicker.c,
    };

    this.marketService.purchaseStock(payload).subscribe({
      next: (response) => {
        this.purchaseMessage = `Successfully purchased ${amount} shares of ${this.selectedTicker?.T}!`;
        console.log('Purchase Response:', response);
      },
      error: (error) => {
        this.purchaseMessage = 'Failed to purchase stock. Try again.';
        console.error('Purchase Error:', error);
      },
    });
  }

  sellStock(amount: number): void {
    console.log(this.userId);
    if (!this.selectedTicker || amount <= 0) {
      this.purchaseMessage = 'Please select a stock and enter a valid amount.';
      return;
    }

    this.marketService.getUserStocks(this.userId).subscribe({
      next: (response) => {
        this.sellMessage = `Successfully fetched user stocks!`;
        console.log('Fetch Response:', response);
      },
      error: (error) => {
        this.sellMessage = 'Failed to fetch user stocks. Try again.';
        console.error('Fetch Error:', error);
      },
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(
      this.filteredTickers.length / this.itemsPerPage
    );
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTickers = this.filteredTickers.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  selectTicker(ticker: TickerResult): void {
    this.selectedTicker = ticker;
    this.amount = 1;
  }

  filterTickers(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredTickers = this.tickers.filter((ticker) =>
      ticker.T.toLowerCase().includes(query)
    );
    this.currentPage = 1;
    this.updatePagination();
  }
}
