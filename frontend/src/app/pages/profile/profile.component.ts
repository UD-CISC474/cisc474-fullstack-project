// import { CommonModule } from '@angular/common';
// import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import {
//   FormControl,
//   FormsModule,
//   ReactiveFormsModule,
//   Validators,
// } from '@angular/forms';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatIconModule } from '@angular/material/icon';
// import { MatInputModule } from '@angular/material/input';
// import { MatTabsModule } from '@angular/material/tabs';
// import { merge } from 'rxjs';

// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   imports: [
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatIconModule,
//     MatTabsModule,
//     FormsModule,
//     ReactiveFormsModule,
//     CommonModule,
//   ],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   templateUrl: './profile.component.html',
//   styleUrl: './profile.component.scss',
// })
// export class ProfileComponent {
//   hideLogin = signal(true);
//   hideSignup = signal(true);
//   hideConfirm = signal(true);

//   clickEvent(event: MouseEvent, type: 'login' | 'signup' | 'confirm') {
//     if (type === 'login') {
//       this.hideLogin.set(!this.hideLogin());
//     } else if (type === 'signup') {
//       this.hideSignup.set(!this.hideSignup());
//     } else if (type === 'confirm') {
//       this.hideConfirm.set(!this.hideConfirm());
//     }
//     event.stopPropagation();
//   }

//   loginUsername = new FormControl('', [Validators.required]);
//   loginPassword = new FormControl('', [Validators.required]);
//   signupUsername = new FormControl('', [Validators.required]);
//   signupPassword = new FormControl('', [Validators.required]);
//   confirmPassword = new FormControl('', [Validators.required]);

//   constructor() {
//     // Listen for changes in confirmPassword to validate password matching
//     merge(this.confirmPassword.statusChanges, this.confirmPassword.valueChanges)
//       .pipe(takeUntilDestroyed())
//       .subscribe(() => this.updateMatchMessage());
//   }

//   onTabChange(event: any) {
//     if (event.index === 0) {
//       this.loginUsername.reset();
//       this.loginPassword.reset();
//     } else if (event.index === 1) {
//       this.signupUsername.reset();
//       this.signupPassword.reset();
//       this.confirmPassword.reset();
//     }
//   }

//   updateMatchMessage() {
//     if (this.signupPassword.valid && this.confirmPassword.valid) {
//       if (this.signupPassword.value === this.confirmPassword.value) {
//         if (this.confirmPassword.hasError('mismatch')) {
//           this.confirmPassword.setErrors(null);
//         }
//       } else {
//         if (!this.confirmPassword.hasError('mismatch')) {
//           this.confirmPassword.setErrors({ mismatch: true });
//         }
//       }
//     }
//   }

//   onLogin() {
//     if (this.loginUsername.invalid || this.loginPassword.invalid) {
//       if (this.loginUsername.invalid) {
//         console.log('Invalid username');
//       }
//       if (this.loginPassword.invalid) {
//         console.log('Invalid password');
//       }
//       this.loginUsername.markAllAsTouched();
//       this.loginPassword.markAllAsTouched();
//     } else {
//       console.log(
//         'Logging in with:',
//         this.loginUsername.value,
//         this.loginPassword.value
//       );
//     }
//   }

//   onSignUp() {
//     if (
//       this.signupUsername.invalid ||
//       this.signupPassword.invalid ||
//       this.confirmPassword.invalid
//     ) {
//       if (this.signupUsername.invalid) {
//         console.log('Invalid username');
//       }
//       if (this.signupPassword.invalid) {
//         console.log('Invalid password');
//       }
//       if (this.confirmPassword.invalid) {
//         console.log('Invalid password confirmation');
//       }
//       this.signupUsername.markAllAsTouched();
//       this.signupPassword.markAllAsTouched();
//       this.confirmPassword.markAllAsTouched();
//     } else if (this.signupPassword.value !== this.confirmPassword.value) {
//       console.log('Passwords do not match');
//     } else {
//       console.log(
//         'Signing up with:',
//         this.signupUsername.value,
//         this.signupPassword.value
//       );
//     }
//   }
// }

import { Component } from '@angular/core';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { provideAuth, getAuth, Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { provideDatabase, getDatabase, Database, ref, set } from '@angular/fire/database';
import { CommonModule } from '@angular/common';
//import { environment } from 'environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  loginUsername = new FormControl('', [Validators.required]);
  loginPassword = new FormControl('', [Validators.required]);
  signupUsername = new FormControl('', [Validators.required]);
  signupPassword = new FormControl('', [Validators.required]);
  confirmPassword = new FormControl('', [Validators.required]);

  // Inject the auth and database services
  constructor(private auth: Auth, private db: Database) {}

  async onSignUp() {
    if (this.signupUsername.invalid || this.signupPassword.invalid || this.confirmPassword.invalid) {
      console.error('Please fill in the required fields');
      return;
    }

    if (this.signupPassword.value !== this.confirmPassword.value) {
      console.error('Passwords do not match');
      return;
    }

    try {
      const email = `${this.signupUsername.value}@example.com`;
      const password = this.signupPassword.value!;
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

      const userId = userCredential.user.uid;
      // Store user information in Firebase Realtime Database
      await set(ref(this.db, 'users/' + userId), {
        username: this.signupUsername.value,
        portfolio: {},
      });

      console.log('User signed up successfully');
    } catch (error) {
      console.error('Sign-up failed:', error);
    }
  }

  async onLogin() {
    if (this.loginUsername.invalid || this.loginPassword.invalid) {
      console.error('Please fill in the required fields');
      return;
    }

    try {
      const email = `${this.loginUsername.value}@example.com`;
      const password = this.loginPassword.value!;
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);

      console.log('User logged in successfully');
    } catch (error) {
      console.error('Login failed:', error);
    }
  }
}
