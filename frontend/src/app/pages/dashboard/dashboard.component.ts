import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatGridListModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  tiles: Tile[] = [
    {
      text: 'NASDAQ, DOW, S&P:',
      cols: 4,
      rows: 1,
      color: 'lightblue',
    },
    {
      text: 'Portfolio Portfolio Value % and $ Change:',
      cols: 4,
      rows: 1,
      color: '#DDBDF1',
    },
    { text: 'Highest Earner:', cols: 2, rows: 1, color: 'lightgreen' },
    { text: 'Biggest Loser:', cols: 2, rows: 1, color: 'lightpink' },
    { text: 'Recent News 1:', cols: 1, rows: 1, color: '#DDBDF1' },
    { text: 'Recent News 2:', cols: 1, rows: 1, color: '#DDBDF1' },
    { text: 'Recent News 3:', cols: 1, rows: 1, color: '#DDBDF1' },
    { text: 'Recent News 4:', cols: 1, rows: 1, color: '#DDBDF1' },
  ];
}

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}
