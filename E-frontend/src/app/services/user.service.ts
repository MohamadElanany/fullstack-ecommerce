import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  list(params: any = {}): Observable<any> {
    return this.http.get<any>(this.api, {
      params,
      ...this.auth.getAuthHeaders()
    });
  }

  get(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`, this.auth.getAuthHeaders());
  }

  update(id: string, payload: any): Observable<any> {
    return this.http.patch<any>(
      `${this.api}/${id}`,
      payload,
      this.auth.getAuthHeaders()
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.api}/${id}`,
      this.auth.getAuthHeaders()
    );
  }
}
