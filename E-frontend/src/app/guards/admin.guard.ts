import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  private decodeJwtPayload(token: string | null): any | null {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  }

  canActivate(): boolean | UrlTree {
    const token = this.auth.getToken();
    const payload = this.decodeJwtPayload(token);

    let role = payload?.role ?? null;

    if (!role) {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const user = JSON.parse(raw);
          role = user?.role ?? null;
        }
      } catch {
        role = null;
      }
    }


    if (role === 'admin') return true;

    return this.router.parseUrl('/login');
  }
}
