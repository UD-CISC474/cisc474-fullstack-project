import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { merge } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  hideLogin = signal(true);
  hideSignup = signal(true);
  hideConfirm = signal(true);

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

  loginUsername = new FormControl('', [Validators.required]);
  loginPassword = new FormControl('', [Validators.required]);
  signupUsername = new FormControl('', [Validators.required]);
  signupPassword = new FormControl('', [Validators.required]);
  confirmPassword = new FormControl('', [Validators.required]);

  constructor() {
    // Listen for changes in confirmPassword to validate password matching
    merge(this.confirmPassword.statusChanges, this.confirmPassword.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateMatchMessage());
  }

  onTabChange(event: any) {
    if (event.index === 0) {
      this.loginUsername.reset();
      this.loginPassword.reset();
    } else if (event.index === 1) {
      this.signupUsername.reset();
      this.signupPassword.reset();
      this.confirmPassword.reset();
    }
  }

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

  onLogin() {
    if (this.loginUsername.invalid || this.loginPassword.invalid) {
      if (this.loginUsername.invalid) {
        console.log('Invalid username');
      }
      if (this.loginPassword.invalid) {
        console.log('Invalid password');
      }
      this.loginUsername.markAllAsTouched();
      this.loginPassword.markAllAsTouched();
    } else {
      console.log(
        'Logging in with:',
        this.loginUsername.value,
        this.loginPassword.value
      );
    }
  }

  onSignUp() {
    if (
      this.signupUsername.invalid ||
      this.signupPassword.invalid ||
      this.confirmPassword.invalid
    ) {
      if (this.signupUsername.invalid) {
        console.log('Invalid username');
      }
      if (this.signupPassword.invalid) {
        console.log('Invalid password');
      }
      if (this.confirmPassword.invalid) {
        console.log('Invalid password confirmation');
      }
      this.signupUsername.markAllAsTouched();
      this.signupPassword.markAllAsTouched();
      this.confirmPassword.markAllAsTouched();
    } else if (this.signupPassword.value !== this.confirmPassword.value) {
      console.log('Passwords do not match');
    } else {
      console.log(
        'Signing up with:',
        this.signupUsername.value,
        this.signupPassword.value
      );
    }
  }
}
