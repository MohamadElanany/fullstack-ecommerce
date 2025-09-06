import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private base = '/api/reports';

  constructor(private http: HttpClient) {}

  private makeAuthHeaders(): HttpHeaders | undefined {
    const token = localStorage.getItem('token');
    if (!token) return undefined;
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getSales(from: string, to: string): Observable<any> {
    let params = new HttpParams().set('from', from).set('to', to);
    const headers = this.makeAuthHeaders();
    return this.http.get(`${this.base}/sales`, headers ? { params, headers } : { params });
  }

  getSoldProducts(from: string, to: string, limit: number): Observable<any> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('limit', String(limit));
    const headers = this.makeAuthHeaders();
    return this.http.get(`${this.base}/sold-products`, headers ? { params, headers } : { params });
  }
}
