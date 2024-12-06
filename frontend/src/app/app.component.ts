import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, HeaderComponent, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'SuperTrader';

  showHeader = false;
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkHeaderVisibility(this.router.url);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkHeaderVisibility(event.url);
      }
    });
  }

  checkHeaderVisibility(url: string) {
    const currentURL = url === '/' ? '/profile':url;
    this.showHeader = currentURL != '/profile';
  }
}
