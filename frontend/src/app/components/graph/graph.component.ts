import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexMarkers,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { CompanyResponse, Price } from '../../interfaces';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  standalone: true,
  imports: [NgApexchartsModule],
})
export class GraphComponent implements OnChanges {
  @Input() stockData!: CompanyResponse;

  public series: ApexAxisChartSeries = [];
  public chart: ApexChart = {
    type: 'area',
    height: 350,
    zoom: {
      enabled: false,
    },
  };

  public dataLabels: ApexDataLabels = {
    enabled: false,
  };
  public markers: ApexMarkers = {
    size: 0,
  };
  public title: ApexTitleSubtitle = {
    text: 'Stock Price Movement',
    align: 'left',
  };
  public fill: ApexFill = {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      inverseColors: false,
      opacityFrom: 0.5,
      opacityTo: 0,
      stops: [0, 90, 100],
    },
  };
  public yaxis: ApexYAxis = {
    labels: {
      formatter: (val) => val.toFixed(2),
    },
    title: {
      text: 'Price (USD)',
    },
  };
  public xaxis: ApexXAxis = {
    type: 'datetime',
  };
  public tooltip: ApexTooltip = {
    shared: false,
    y: {
      formatter: (val) => `${val.toFixed(2)} USD`,
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stockData'] && this.stockData) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    const prices = this.stockData.prices || [];
    const data = prices.map((entry: Price) => [
      entry.openTimestamp,
      entry.close,
    ]);

    this.series = [
      {
        name: this.stockData.ticker || 'Stock',
        data: data,
      },
    ];
  }
}
