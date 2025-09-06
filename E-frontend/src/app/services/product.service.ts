import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Product, ProductListResponse } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}


  getProducts(params: {
    q?: string;
    category?: string;
    section?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sort?: string;
  } = {}): Observable<ProductListResponse> {
    let httpParams = new HttpParams();
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.section) httpParams = httpParams.set('section', params.section);
    if (params.minPrice != null) httpParams = httpParams.set('minPrice', String(params.minPrice));
    if (params.maxPrice != null) httpParams = httpParams.set('maxPrice', String(params.maxPrice));
    if (params.page != null) httpParams = httpParams.set('page', String(params.page));
    if (params.limit != null) httpParams = httpParams.set('limit', String(params.limit));
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return this.http.get<ProductListResponse>(this.api, { params: httpParams });
  }

  
  getProduct(id: string): Observable<{ product: Product }> {
    return this.http.get<{ product: Product }>(`${this.api}/${id}`);
  }
}
