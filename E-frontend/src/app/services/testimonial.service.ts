import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TestimonialService {
  private api = `${environment.apiUrl}/testimonials`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  create(text: string): Observable<any> {
    return this.http.post<any>(this.api, { text }, this.getAuthOptions());
  }

  listPublic(): Observable<any> {
    return this.http.get<any>(this.api);
  }

  listAllAdmin(): Observable<any[]> {
    return this.http
      .get<any>(`${this.api}/admin/all`, this.getAuthOptions())
      .pipe(
        map(res => {
          if (Array.isArray(res)) return res;
          return res.testimonials ?? res.items ?? res.data ?? [];
        })
      );
  }

  approve(id: string, approve: boolean): Observable<any> {
    return this.http.put<any>(
      `${this.api}/admin/${id}/approve`,
      { approve },
      this.getAuthOptions()
    );
  }

  private getAuthOptions() {
    const opts = this.auth.getAuthHeaders?.() ?? {};
    return opts;
  }
}
