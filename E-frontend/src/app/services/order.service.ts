import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient, private auth: AuthService) {}


  createOrder(): Observable<any> {
    return this.http.post<any>(this.api, {}, this.auth.getAuthHeaders());
  }


  getOrders(): Observable<any> {
    return this.http.get<any>(this.api, this.auth.getAuthHeaders());
  }

  
  getOrder(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`, this.auth.getAuthHeaders());
  }
}
