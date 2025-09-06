import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getCategories(section?: string): Observable<any> {
    let params: any = {};
    if (section) params.section = section;
    return this.http.get<any>(this.api, { params });
  }

  getCategory(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  create(payload: Partial<Category>): Observable<any> {
    return this.http.post<any>(this.api, payload, this.auth.getAuthHeaders());
  }

  update(id: string, payload: Partial<Category>): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, payload, this.auth.getAuthHeaders());
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}`, this.auth.getAuthHeaders());
  }
}

export interface Category {
  _id: string;
  name: string;
  section: string;
}
