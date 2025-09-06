import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private api = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  list(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (params.limit) httpParams = httpParams.set('limit', String(params.limit));
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.section) httpParams = httpParams.set('section', params.section);
    if (params.minPrice) httpParams = httpParams.set('minPrice', String(params.minPrice));
    if (params.maxPrice) httpParams = httpParams.set('maxPrice', String(params.maxPrice));

    return this.http.get<any>(this.api, { params: httpParams, ...this.auth.getAuthHeaders() });
  }

  get(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`, this.auth.getAuthHeaders());
  }

  create(data: FormData): Observable<any> {
    const headers = this.auth.getHttpHeaders();
    return this.http.post<any>(this.api, data, { headers });
  }

  update(id: string, data: FormData | any): Observable<any> {
    const headers = this.auth.getHttpHeaders();
    if (data instanceof FormData) {
      return this.http.put<any>(`${this.api}/${id}`, data, { headers });
    }
    return this.http.put<any>(`${this.api}/${id}`, data, { headers: this.auth.getAuthHeaders().headers });
  }

  softDelete(id: string): Observable<any> {
    const headers = this.auth.getHttpHeaders();
    return this.http.delete<any>(`${this.api}/${id}`, { headers });
  }
}
