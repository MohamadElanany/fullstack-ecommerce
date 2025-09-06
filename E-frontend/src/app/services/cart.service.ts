import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getCart(): Observable<any> {
    return this.http.get<any>(`${this.api}`, this.auth.getAuthHeaders());
  }

  addToCart(productId: string, quantity = 1): Observable<any> {
    return this.http.post<any>(`${this.api}/add`, { productId, quantity }, this.auth.getAuthHeaders());
  }

  update(productId: string, quantity: number) {
    return this.http.post<any>(`${this.api}/update`, { productId, quantity }, this.auth.getAuthHeaders());
  }

  remove(productId: string) {
    return this.http.post<any>(`${this.api}/remove`, { productId }, this.auth.getAuthHeaders());
  }
}
