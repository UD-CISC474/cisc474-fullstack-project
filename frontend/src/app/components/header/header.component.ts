import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatTabsModule, MatButtonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  selectedIndex = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects === '/dashboard') {
          this.selectedIndex = 0;
        } else if (event.urlAfterRedirects === '/portfolio') {
          this.selectedIndex = 1;
        } else if (event.urlAfterRedirects === '/market') {
          this.selectedIndex = 2;
        }
      }
    });
  }

  onTabChange(index: number) {
    this.selectedIndex = index;
    if (index === 0) {
      this.router.navigate(['/dashboard']);
    } else if (index === 1) {
      this.router.navigate(['/portfolio']);
    } else if (index === 2) {
      this.router.navigate(['/market']);
    }
  }
}
