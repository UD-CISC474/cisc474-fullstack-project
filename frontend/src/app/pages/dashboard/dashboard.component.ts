import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatGridListModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {
tiles: Tile[] = [
    {text: 'Temp', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Temp', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Temp', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Temp', cols: 1, rows: 2, color: 'lightpink'},
    {text: 'Temp', cols: 2, rows: 2, color: '#DDBDF1'},
    {text: 'Temp', cols: 1, rows: 2, color: '#DDBDF1'},
  ];
}
export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}
