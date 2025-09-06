import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-page">
      <h2>Register</h2>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        <div class="form-group">
          <label>Name</label>
          <input type="text" formControlName="name" placeholder="Enter your name" />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input type="email" formControlName="email" placeholder="Enter your email" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" formControlName="password" placeholder="Enter your password" />
        </div>

        <div class="form-group">
          <label>Phone (optional)</label>
          <input type="text" formControlName="phone" placeholder="Enter your phone number" />
        </div>

        <div class="form-group">
          <label>Address (optional)</label>
          <input type="text" formControlName="address" placeholder="Enter your address" />
        </div>

        <button type="submit" [disabled]="loading">
          <span *ngIf="!loading">Register</span>
          <span *ngIf="loading">Processing...</span>
        </button>
      </form>

      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .auth-page { max-width:400px; margin:40px auto; padding:20px; border:1px solid #eee; border-radius:8px; background:#fff; }
    h2 { margin-bottom:16px; text-align:center; }
    .form { display:flex; flex-direction:column; gap:12px; }
    .form-group { display:flex; flex-direction:column; gap:4px; }
    input { padding:8px; border:1px solid #ccc; border-radius:4px; }
    button { margin-top:12px; padding:10px; border:none; border-radius:4px; background:#388e3c; color:#fff; cursor:pointer; }
    button:hover { background:#2e7d32; }
    button[disabled] { background:#ccc; cursor:not-allowed; }
    .error { margin-top:12px; color:#c62828; text-align:center; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      phone: [''],
      address: ['']
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const payload = this.form.value as { name: string; email: string; password: string; phone?: string; address?: string };

    this.auth.register(payload).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/']); },
      error: err => { this.loading = false; this.error = err?.error?.message || 'Registration failed'; }
    });
  }
}
