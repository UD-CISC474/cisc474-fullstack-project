import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MarketComponent } from './pages/market/market.component';

export const routes: Routes = [
  // change redirect to /profile when auth is integrated
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: 'portfolio',
    loadComponent: () =>
      import('./pages/portfolio/portfolio.component').then(
        (m) => m.PortfolioComponent
      ),
  },
  {
    path: 'market',
    loadComponent: () =>
      import('./pages/market/market.component').then((m) => m.MarketComponent),
  },
  {
    path: 'user',
    loadComponent: () =>
      import('./pages/user/user.component').then((m) => m.UserComponent),
  },
];
