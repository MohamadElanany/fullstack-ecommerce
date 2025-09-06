import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';
import { Product } from '../../models/product';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { ProductCardComponent } from '../../components/product-card';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProductCardComponent],
  template: `
    <h2>Products</h2>

    <form [formGroup]="filterForm" class="filters" (ngSubmit)="$event.preventDefault()">
      <input formControlName="q" placeholder="Search products..." />

      <select formControlName="section">
        <option value="">All sections</option>
        <option value="mens">Mens</option>
        <option value="womens">Womens</option>
        <option value="unisex">Unisex</option>
      </select>

      <select formControlName="category">
        <option value="">All categories</option>
        <option *ngFor="let c of categories" [value]="c._id">{{ c.name }}</option>
      </select>

      <input formControlName="minPrice" placeholder="Min price" type="number" />
      <input formControlName="maxPrice" placeholder="Max price" type="number" />

      <select formControlName="sort">
        <option value="">Default</option>
        <option value="price_asc">Price: Low → High</option>
        <option value="price_desc">Price: High → Low</option>
        <option value="newest">Newest</option>
      </select>
    </form>

    <div *ngIf="loading" class="loading">Loading...</div>
    <div *ngIf="!loading && products.length === 0" class="empty">No products found</div>

    <div class="grid" *ngIf="!loading && products.length > 0">
      <app-product-card *ngFor="let p of products; trackBy: trackById" [product]="p"></app-product-card>
    </div>

    <div class="pagination" *ngIf="total > 0">
      <button (click)="prevPage()" [disabled]="page <= 1">Prev</button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button (click)="nextPage()" [disabled]="page >= totalPages">Next</button>
    </div>
  `,
  styles: [`
    h2 { margin-bottom: 16px; }

    .filters {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      background: #fff;
      padding: 12px;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      margin-bottom: 16px;
    }

    input, select {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 14px;
      min-width: 140px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill,minmax(220px,1fr));
      gap: 16px;
    }

    .loading, .empty {
      padding: 16px;
      text-align: center;
      color: #666;
    }

    .pagination {
      margin-top: 20px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
    }

    .pagination button {
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      background: #2f86eb;
      color: #fff;
      cursor: pointer;
      transition: 0.2s;
    }

    .pagination button:hover:not([disabled]) {
      background: #246dcc;
    }

    .pagination button[disabled] {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class ProductsComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  products: Product[] = [];
  categories: Category[] = [];
  loading = false;
  page = 1;
  limit = 12;
  total = 0;
  totalPages = 1;

  private destroy$ = new Subject<void>();
  private refresh$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productSvc: ProductService,
    private categorySvc: CategoryService
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      q: [''],
      category: [''],
      section: [''],
      minPrice: [''],
      maxPrice: [''],
      sort: ['']
    });

    this.loadCategories(this.filterForm.value.section);

    this.filterForm.get('section')!.valueChanges.pipe(
      debounceTime(150),
      tap((s: string) => {
        this.loadCategories(s);
        this.filterForm.patchValue({ category: '' }, { emitEvent: false });
        this.page = 1;
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.filterForm.valueChanges.pipe(
      debounceTime(400),
      tap(() => { this.page = 1; }),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadProducts());

    this.refresh$.pipe(takeUntil(this.destroy$)).subscribe(() => this.loadProducts());

    this.loadProducts();
  }

  private buildParams() {
    const v = this.filterForm.value;
    return {
      q: v.q || undefined,
      category: v.category || undefined,
      section: v.section || undefined,
      minPrice: v.minPrice ? Number(v.minPrice) : undefined,
      maxPrice: v.maxPrice ? Number(v.maxPrice) : undefined,
      page: this.page,
      limit: this.limit,
      sort: v.sort || undefined
    };
  }

  loadProducts() {
    this.loading = true;
    const params = this.buildParams();

    this.productSvc.getProducts(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        const items = Array.isArray(res) ? res as any[] : (res.items ?? []);
        const sortValue = params.sort as string | undefined;
        const sorted = this.applySort(items, sortValue);
        this.products = sorted;
        this.total = (res && typeof (res as any).total === 'number') ? (res as any).total : this.products.length;
        this.page = (res && (res as any).page) ? (res as any).page : this.page;
        this.limit = (res && (res as any).limit) ? (res as any).limit : this.limit;
        this.totalPages = Math.max(1, Math.ceil(this.total / this.limit || 1));
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to load products', err);
      }
    });
  }

  private applySort(items: any[], sort?: string): any[] {
    if (!Array.isArray(items) || items.length === 0) return items;
    if (!sort) return items;
    const arr = [...items];

    if (sort === 'price_asc') {
      arr.sort((a, b) => (parseFloat(a?.price ?? 0)) - (parseFloat(b?.price ?? 0)));
    } else if (sort === 'price_desc') {
      arr.sort((a, b) => (parseFloat(b?.price ?? 0)) - (parseFloat(a?.price ?? 0)));
    } else if (sort === 'newest') {
      arr.sort((a, b) => {
        const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
    }
    return arr;
  }

  prevPage() {
    if (this.page <= 1) return;
    this.page--;
    this.refresh$.next();
  }

  nextPage() {
    if (this.page >= this.totalPages) return;
    this.page++;
    this.refresh$.next();
  }

  trackById(index: number, item: Product) {
    return (item && (item as any)._id) || index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(section?: string) {
    this.categorySvc.getCategories(section).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.categories = Array.isArray(res) ? res : (res?.categories ?? res?.items ?? res?.data ?? []);
      },
      error: () => {
        this.categories = [];
      }
    });
  }
}
