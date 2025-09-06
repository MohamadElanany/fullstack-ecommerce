import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';


export interface User {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: 'user' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  user$ = this.userSubject.asObservable();


  constructor(private http: HttpClient  , private router: Router) {}

  register(payload: { name: string; email: string; password: string; phone?: string; address?: string; }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, payload).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, payload).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  private handleAuthSuccess(res: AuthResponse) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.userSubject.next(res.user);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.getToken() || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return { headers };
  }

  getHttpHeaders(): HttpHeaders {
    const token = this.getToken() || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private getUserFromStorage(): User | null {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  }
}
