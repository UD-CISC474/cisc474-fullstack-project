// stocks.component.ts
import { Component, OnInit } from '@angular/core';
import { StocksService, CompanyQueryParams } from '../../services/stocks.service';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit {
  stocks: any[] = [];

  constructor(private stocksService: StocksService) {}

  ngOnInit(): void {
    this.stocksService.getTopStocks().subscribe(stockData => {
      this.stocks = stockData;
    });
  }
}
