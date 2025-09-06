import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../components/spinner.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  template: `
    <div class="auth-page">
      <h2>Login</h2>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        <div class="form-group">
          <label>Email</label>
          <input type="email" formControlName="email" placeholder="Enter your email" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" formControlName="password" placeholder="Enter your password" />
        </div>

        <button type="submit" [disabled]="loading || form.invalid">
          <app-spinner *ngIf="loading" size="small"></app-spinner>
          <span *ngIf="!loading">Login</span>
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
    button { margin-top:12px; padding:10px; border:none; border-radius:4px; background:#1976d2; color:#fff; cursor:pointer; }
    button:hover { background:#1565c0; }
    button[disabled] { background:#ccc; cursor:not-allowed; }
    .error { margin-top:12px; color:#c62828; text-align:center; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const payload = this.form.value as { email: string; password: string };

    this.auth.login(payload).subscribe({
      next: (res: any) => {
        this.loading = false;

        let role: string | null = res?.user?.role ?? null;

        if (!role) {
          try {
            const token = res?.token ?? this.auth.getToken();
            if (token) {
              const payloadObj = JSON.parse(atob(token.split('.')[1]));
              role = payloadObj?.role ?? null;
            }
          } catch (e) {
            role = null;
          }
        }

        if (role === 'admin') {
          this.router.navigate(['/admin/products']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: err => {
        this.loading = false;
        this.error = err?.error?.message || 'Login failed';
        this.toast.error(this.error);
      }
    });
  }
}
