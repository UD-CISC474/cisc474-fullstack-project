// market.component.ts
import { Component, OnInit } from '@angular/core';
import { MarketService } from './market.service';
import { TickerResult, CompanyResponse } from '../../../../../backend/src/polygon';
import { NgFor, NgIf } from '@angular/common';
import dayjs from 'dayjs';
import { FormsModule } from '@angular/forms';
import { getAuth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';


interface Stock {
  stockSymbol: string;
  shares: number;
  price: number;
}

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
  chart: Chart | null = null;

  userId: string = 'default-user'; // Placeholder for user ID
  amount: number = 1;
  purchaseMessage: string = '';
  sellMessage: string = '';

  constructor(private marketService: MarketService) {
    Chart.register(...registerables);
  }

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
      console.log("Ticker response received:", tickerResponse);  // Debug log
      this.tickers = tickerResponse.results;
      this.selectedTicker = this.tickers[0];
      this.filterTickers();
      this.loadGraphData('1D');
    } catch (error) {
      console.error(`Failed to load tickers`, error);
      this.tickers = [];
      this.filteredTickers = [];
    }
  }
  
  async loadGraphData(period: string): Promise<void> {
    if (!this.selectedTicker) return;

    try {
      const fromDate = this.calculateFromDate(period);
      const toDate = new Date().toISOString().substring(0, 10);

      this.marketService.getCompanyData(this.selectedTicker.T, fromDate, toDate, 'half-hour')
        .subscribe(data => {
          this.renderChart(data.data);
        }, error => {
          console.error('Failed to load graph data:', error);
        });
    } catch (error) {
      console.error('Failed to load graph data:', error);
    }
  }

  // calculateFromDate(period: string): string {
  //   const today = new Date();
  //   switch (period) {
  //     case '1D':
  //       return new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0];
  //     case '5D':
  //       return new Date(today.setDate(today.getDate() - 5)).toISOString().split('T')[0];
  //     case '1M':
  //       return new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
  //     case '6M':
  //       return new Date(today.setMonth(today.getMonth() - 6)).toISOString().split('T')[0];
  //     case '1Y':
  //       return new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0];
  //     case '2Y':
  //       return new Date(today.setFullYear(today.getFullYear() - 2)).toISOString().split('T')[0];
  //     default:
  //       return today.toISOString().split('T')[0];
  //   }
  // }

  calculateFromDate(period: string): string {
    const today = dayjs();
    switch (period) {
      case '1D':
        return today.subtract(1, 'day').format('YYYY-MM-DD');
      case '5D':
        return today.subtract(5, 'day').format('YYYY-MM-DD');
      case '1M':
        return today.subtract(1, 'month').format('YYYY-MM-DD');
      case '6M':
        return today.subtract(6, 'month').format('YYYY-MM-DD');
      case '1Y':
        return today.subtract(1, 'year').format('YYYY-MM-DD');
      case '2Y':
        return today.subtract(2, 'year').format('YYYY-MM-DD');
      default:
        return today.format('YYYY-MM-DD');
    }
  }

  renderChart(data: CompanyResponse) {
    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
      this.chart = null; // Set it to null after destroying
    }
  
    const labels = data.prices.map((point) => new Date(point.openTimestamp).toLocaleString());
    const prices = data.prices.map((point) => point.close);
  
    const ctx = (document.getElementById('stockChart') as HTMLCanvasElement).getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: `Price of ${this.selectedTicker?.T} over Time`,
              data: prices,
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: this.getTimeUnit(data),
              },
            },
            y: {
              beginAtZero: false,
            },
          },
        },
      });
    }
  }
  
  getTimeUnit(data: CompanyResponse) {
    const timeRange = new Date(data.end).getTime() - new Date(data.start).getTime();
    if (timeRange <= 24 * 60 * 60 * 1000) {
      return 'hour';
    } else if (timeRange <= 7 * 24 * 60 * 60 * 1000) {
      return 'day';
    } else {
      return 'month';
    }
  }

  selectTicker(ticker: TickerResult): void {
    this.selectedTicker = ticker;
    this.amount = 1;
    this.loadGraphData('1D'); // Default to '1 Day' when selecting a stock
  }

  filterTickers(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredTickers = this.tickers.filter((ticker) =>
      ticker.T.toLowerCase().includes(query)
    );
    this.currentPage = 1;
    this.updatePagination();
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

  increaseAmount(): void {
    this.amount++;
  }

  decreaseAmount(): void {
    if (this.amount > 1) {
      this.amount--;
    }
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

  async sellStock(amount: number): Promise<void> {
    try {
      const response = await this.getStocks();
      const userStocks: { [key: string]: Stock } = response.stocks;

      // Convert userStocks to an array of [key, stock] pairs
      const userStocksArray: { id: string; stock: Stock }[] = Object.entries(
        userStocks
      ).map(([id, stock]) => ({
        id,
        stock,
      }));

      if (userStocksArray && userStocksArray.length > 0) {
        const stockToSell = userStocksArray.find(
          ({ stock }) =>
            stock.stockSymbol === this.selectedTicker?.T &&
            stock.price === this.selectedTicker?.c &&
            amount <= stock.shares
        );

        if (stockToSell) {
          console.log(
            `Selling ${amount} shares of ${stockToSell.stock.stockSymbol}`
          );

          if (!this.selectedTicker || amount <= 0) {
            this.purchaseMessage =
              'Please select a stock and enter a valid amount.';
            return;
          }

          const payload = {
            userId: this.userId,
            stockSymbol: this.selectedTicker.T,
            shares: stockToSell.stock.shares - amount,
            price: this.selectedTicker.c,
            stockId: stockToSell.id,
          };

          this.marketService.updateUserStocks(payload).subscribe({
            next: (response) => {
              console.log('Update successful:', response);
            },
            error: (error) => {
              console.error('Error updating stock:', error);
            },
          });
        } else {
          console.log('Selected stock not found in user holdings');
        }
      } else {
        console.log('No stocks found in user holdings');
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  }

  getStocks(): Promise<any> {
    return this.marketService.getUserStocks(this.userId).toPromise();
  }
}
