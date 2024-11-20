import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  getAuth,
  provideAuth,
  initializeAuth,
  browserLocalPersistence,
} from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideFirebaseApp, FirebaseApp } from '@angular/fire/app';
import { initializeApp } from 'firebase/app';
import { environment } from '../../../backend/src/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(environment.FIREBASE_CONFIG)),
    provideAuth(() => {
      const app = initializeApp(environment.FIREBASE_CONFIG);
      const auth = initializeAuth(app, {
        persistence: browserLocalPersistence,
      });
      return auth;
    }),
    provideDatabase(() => getDatabase()),
  ],
};
