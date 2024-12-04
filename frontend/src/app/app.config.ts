import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideAuth,
  initializeAuth,
  browserLocalPersistence,
} from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { environment } from '../../../backend/src/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(environment.FIREBASE_CONFIG)),
    provideAuth(() =>
      initializeAuth(initializeApp(environment.FIREBASE_CONFIG), {
        persistence: browserLocalPersistence,
      })
    ),
    provideDatabase(() => getDatabase()),
  ],
};
