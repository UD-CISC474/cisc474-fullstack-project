import { Component, ChangeDetectorRef } from '@angular/core';
import {
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, signal } from '@angular/core';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

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
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  // State for toggling password visibility
  hideLogin = signal(true);
  hideSignup = signal(true);
  hideConfirm = signal(true);

  // Form controls for login and signup
  loginUsername = new FormControl('', [Validators.required]);
  loginPassword = new FormControl('', [Validators.required]);
  signupUsername = new FormControl('', [Validators.required]);
  signupPassword = new FormControl('', [Validators.required]);
  confirmPassword = new FormControl('', [Validators.required]);

  selectedIndex = 0;

  // Constructor to inject Firebase Auth and Database services
  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    // Listen for changes in confirmPassword to validate password matching
    merge(this.confirmPassword.statusChanges, this.confirmPassword.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateMatchMessage());
  }

  // Toggles password visibility for login, signup, or confirm password fields
  clickEvent(event: MouseEvent, type: 'login' | 'signup' | 'confirm') {
    if (type === 'login') {
      this.hideLogin.set(!this.hideLogin());
    } else if (type === 'signup') {
      this.hideSignup.set(!this.hideSignup());
    } else if (type === 'confirm') {
      this.hideConfirm.set(!this.hideConfirm());
    }
    event.stopPropagation();
  }

  // Resets form data when switching between tabs
  onTabChange(event: any) {
    if (event.index === 0) {
      this.loginUsername.reset();
      this.loginPassword.reset();
    } else if (event.index === 1) {
      this.signupUsername.reset();
      this.signupPassword.reset();
      this.confirmPassword.reset();
    }
    const loginErrorMessage = document.getElementById('login-error-message')! as HTMLElement;
    const signupErrorMessage = document.getElementById('signup-error-message')! as HTMLElement;
    loginErrorMessage.style.display = 'none';
    signupErrorMessage.style.display = 'none';
  }

  // Validates if signup password and confirm password match
  updateMatchMessage() {
    if (this.signupPassword.valid && this.confirmPassword.valid) {
      if (this.signupPassword.value === this.confirmPassword.value) {
        if (this.confirmPassword.hasError('mismatch')) {
          this.confirmPassword.setErrors(null);
        }
      } else {
        if (!this.confirmPassword.hasError('mismatch')) {
          this.confirmPassword.setErrors({ mismatch: true });
        }
      }
    }
  }

  // Handles user login
  async onLogin() {
    if (this.loginUsername.invalid || this.loginPassword.invalid) {
      console.error('Please fill in the required fields');
      this.loginUsername.markAllAsTouched();
      this.loginPassword.markAllAsTouched();
      return;
    }

    try {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');

      const username = `${this.loginUsername.value}`;
      const password = this.loginPassword.value!;

      const errorMessage = document.getElementById('login-error-message')! as HTMLElement;
      const errorMessageText = document.getElementById('login-error-message-text') as HTMLElement;

      const response = await fetch('http://localhost:3000/api/login', {
        headers,
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log(data)
      if (response.ok) {
        if (!data.valid) {
          console.error('Login failed:', data.message || 'Unknown error');
          errorMessageText.textContent = data.message;
          errorMessage.style.display = 'block';
        }else {
          localStorage.setItem('username', username);
        localStorage.setItem('token', data.token);
        console.log('User logged in successfully!');
        console.log('token:' + localStorage.getItem('token'))
        this.router.navigate(['/dashboard']);
        }
        
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  // Handles user sign-up
  async onSignUp() {
    if (
      this.signupUsername.invalid ||
      this.signupPassword.invalid ||
      this.confirmPassword.invalid
    ) {
      console.error('Please fill in the required fields');
      this.signupUsername.markAllAsTouched();
      this.signupPassword.markAllAsTouched();
      this.confirmPassword.markAllAsTouched();
      return;
    }

    if (this.signupPassword.value !== this.confirmPassword.value) {
      console.error('Passwords do not match');
      return;
    }

    try {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');

      const username = `${this.signupUsername.value}`;
      const password = this.signupPassword.value!;

      const errorMessage = document.getElementById('signup-error-message')! as HTMLElement;
      const errorMessageText = document.getElementById('signup-error-message-text') as HTMLElement;


      const response = await fetch('http://localhost:3000/api/create-account', {
        headers,
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.valid) {
          localStorage.setItem('username', username);
          localStorage.setItem('token', data.token);
          console.log('User signed up successfully');
          alert(`Signed up successfully`);

          // this.router.navigate(['/dashboard']);
          this.selectedIndex = 0;
          this.cdr.markForCheck();
        }else {
        console.error('Signup failed:', data.message || 'Unknown error');
        // alert(`Signup failed: ${data.message}`);
        errorMessageText.textContent = data.message;
        errorMessage.style.display = 'block';
      }
      } 
      // this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Sign-up failed:', error);
    }
  }
}
