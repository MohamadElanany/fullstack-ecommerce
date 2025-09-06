import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private api = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  sendMessage(payload: { category: 'complain' | 'question'; message: string }): Observable<any> {
    return this.http.post<any>(this.api, payload, this.getAuthOptionsIfAny());
  }

  listMessages(): Observable<any> {
    return this.http.get<any>(this.api, this.getAuthOptions());
  }

  markSeen(id: string): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}/seen`, {}, this.getAuthOptions());
  }

  private getAuthOptions() {
    const opts = this.auth.getAuthHeaders?.();
    return opts ?? {};
  }

  private getAuthOptionsIfAny() {
    const token = this.auth.getToken?.();
    if (token) return this.getAuthOptions();
    return {};
  }
}
