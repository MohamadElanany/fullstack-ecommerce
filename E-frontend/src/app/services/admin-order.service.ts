import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private api = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  list(params: any = {}): Observable<any> {
    return this.http.get<any>(this.api, { params, ...this.auth.getAuthHeaders() });
  }

  get(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`, this.auth.getAuthHeaders());
  }

  updateStatus(id: string, body: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}/status`, body, this.auth.getAuthHeaders());
  }
}
