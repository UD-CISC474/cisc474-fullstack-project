import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatTabsModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  loginUsername: string = '';
  loginPassword: string = '';
  signupUsername: string = '';
  signupPassword: string = '';
  confirmPassword: string = '';

  onLogin() {
    if (this.loginUsername && this.loginPassword) {
      console.log('Logging in with:', this.loginUsername, this.loginPassword);
    }
  }

  onSignUp() {
    if (this.signupPassword === this.confirmPassword) {
      console.log('Signing up with:', this.signupUsername, this.signupPassword);
    } else {
      console.log('Passwords do not match');
    }
  }
}
