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

  onLogin() {
    // this.selectedIndex = 3;
    this.router.navigate(['/profile']);
  }

  async onLogout() {
    try {
      const username = localStorage.getItem('username');

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');

      const logoutResponse = await fetch('http://localhost:3000/api/logout', {
        headers,
        method: 'POST',
        body: JSON.stringify({ username }),
      });

      const logoutData = await logoutResponse.json();
      if (logoutData.token === '') {
        console.log('Logout succesful!');
        localStorage.removeItem('username');
        localStorage.removeItem('token');
        this.router.navigate(['/profile']);
      } else {
        console.error('Logout unsuccessful. Please try again.');
      }
    } catch (err) {
      console.error(err);
    }
  }
}
