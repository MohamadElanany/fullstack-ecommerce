import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

interface User {
  name?: string;
  email?: string;
  role?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-left">
        <a routerLink="/" class="brand">MyShop</a>
        <a routerLink="/testimonials">Testimonials</a>

        <ng-container *ngIf="(user$ | async) as u">
          <a *ngIf="!isAdmin(u)" routerLink="/products">Products</a>
          <a *ngIf="!isAdmin(u)" routerLink="/contact">Contact</a>
          <a *ngIf="!isAdmin(u)" routerLink="/cart">Cart</a>
          <a *ngIf="!isAdmin(u)" routerLink="/orders">Orders</a>
        </ng-container>

        <ng-container *ngIf="(user$ | async) as u">
          <a *ngIf="isAdmin(u)" routerLink="/admin/products">Admin Products</a>
          <a *ngIf="isAdmin(u)" routerLink="/admin/categories">Categories</a>
          <a *ngIf="isAdmin(u)" routerLink="/admin/orders">Orders</a>
          <a *ngIf="isAdmin(u)" routerLink="/admin/users">Users</a>
          <a *ngIf="isAdmin(u)" routerLink="/admin/testimonials">Testimonials</a>
          <a *ngIf="isAdmin(u)" routerLink="/admin/contact">Messages</a>
          <a *ngIf="isAdmin(u)" routerLink="/admin/reports">Reports</a>
        </ng-container>
      </div>

      <div class="nav-right">
        <ng-container *ngIf="(user$ | async) as u; else guest">
          <span class="user-info">
            {{ u?.name || u?.email || 'User' }}
          </span>
          <button class="logout-btn" (click)="logout()">Logout</button>
        </ng-container>

        <ng-template #guest>
          <a routerLink="/login">Login</a>
          <a routerLink="/register">Register</a>
        </ng-template>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: #fff;
      border-bottom: 1px solid #eee;
    }
    .nav-left, .nav-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand {
      font-weight: 700;
      font-size: 18px;
      color: #2f86eb;
    }
    a {
      text-decoration: none;
      color: #333;
      font-size: 14px;
      transition: 0.2s;
    }
    a:hover {
      color: #2f86eb;
    }
    .user-info {
      font-size: 14px;
      color: #555;
    }
    .logout-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      background: #e74c3c;
      color: #fff;
      cursor: pointer;
      font-size: 14px;
      transition: 0.2s;
    }
    .logout-btn:hover {
      background: #c0392b;
    }
  `]
})
export class NavbarComponent implements OnInit {
  user$!: Observable<User | null>;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.user$ = this.auth.user$;
  }

  isAdmin(u: User | null): boolean {
    return (u?.role === 'admin') || (this.getRoleFromToken() === 'admin');
  }

  private getRoleFromToken(): string | null {
    try {
      const t = this.auth.getToken();
      if (!t) return null;
      const pl = JSON.parse(atob(t.split('.')[1]));
      return pl?.role ?? null;
    } catch {
      return null;
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
