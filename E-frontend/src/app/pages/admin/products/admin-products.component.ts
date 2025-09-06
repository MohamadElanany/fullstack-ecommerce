import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminProductService } from '../../../services/admin-product.service';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '../../../components/spinner.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SpinnerComponent],
  template: `
    <div class="app-shell">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap">
        <h2 style="margin:0">Admin — Products</h2>

        <div style="display:flex;gap:8px;align-items:center;margin-left:auto;flex-wrap:wrap">
          <input [(ngModel)]="q" placeholder="Search by name..." (keyup.enter)="load(true)" style="padding:8px;border-radius:8px;border:1px solid #e6e6e6" />
          <select [(ngModel)]="section" (change)="load(true)" style="padding:8px;border-radius:8px;border:1px solid #e6e6e6">
            <option value="">All sections</option>
            <option value="mens">Mens</option>
            <option value="womens">Womens</option>
            <option value="unisex">Unisex</option>
          </select>

          <button (click)="load(true)" [disabled]="loading" class="btn ghost">Search</button>
          <button (click)="createNew()" class="btn primary">Create product</button>
          <button (click)="showAll()" [disabled]="loading" class="btn ghost">Show all</button>
        </div>
      </div>

      <div *ngIf="loading" class="card" style="padding:18px;text-align:center">
        <app-spinner label="Loading..." size="default"></app-spinner>
      </div>

      <div *ngIf="!loading && products.length === 0" class="card" style="padding:18px;text-align:center">
        No products found.
      </div>

      <div *ngIf="!loading && products.length > 0" class="products-grid">
        <div *ngFor="let p of products" class="product-card card">
          <img [src]="getPhoto(p)" alt="product image" />
          <div class="meta">
            <h4 style="margin:0 0 6px">{{ p.name }}</h4>
            <div class="small muted">{{ p.section }} • {{ p.categoryId?.name || '' }}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
              <div style="font-weight:700">{{ p.price | number:'1.2-2' }} EGP</div>
              <div style="display:flex;gap:8px;align-items:center">
                <button class="btn ghost" (click)="edit(p._id)">Edit</button>
                <button class="btn danger" (click)="remove(p._id)" [disabled]="processingId === p._id">
                  <app-spinner *ngIf="processingId === p._id" size="small"></app-spinner>
                  <span *ngIf="processingId !== p._id">Delete</span>
                </button>
              </div>
            </div>
            <div style="margin-top:8px" class="small muted">Stock: {{ p.stock }}</div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && products.length > 0" style="margin-top:14px;display:flex;justify-content:center;gap:8px;align-items:center">
        <button (click)="loadMore()" [disabled]="loading || isLastPage()" class="btn ghost">Load more</button>
        <button (click)="resetAndLoad()" [disabled]="loading" class="btn ghost">Refresh</button>
      </div>

      <div style="margin-top:12px;text-align:center;color:#555;font-size:13px" *ngIf="total > 0">
        Showing {{ products.length }} of {{ total }}
      </div>
    </div>
  `,
  styles: [`
    .app-shell { max-width:1100px; margin:20px auto; padding:18px; }
    .products-grid {
      display:grid;
      grid-template-columns: repeat(auto-fill,minmax(260px,1fr));
      gap:14px;
      margin-top:12px;
    }
    .product-card { overflow:hidden; padding:0; border-radius:12px; transition:transform .14s, box-shadow .14s; display:flex; flex-direction:column; }
    .product-card:hover { transform:translateY(-4px); box-shadow:0 12px 30px rgba(8,15,30,0.06); }
    .product-card img { width:100%; height:160px; object-fit:cover; display:block; }
    .product-card .meta { padding:12px; display:flex; flex-direction:column; gap:6px; }
    .small { font-size:13px; color:#6b7280; }
    .muted { color:#6b7280; }
    .btn { padding:8px 10px; border-radius:8px; border:none; cursor:pointer; font-weight:700; }
    .btn.primary { background:#0ea5a4; color:white; }
    .btn.ghost { background:transparent; border:1px solid #e6e6e6; color:#374151; }
    .btn.danger { background:#ef4444; color:white; }
    .card { background:white; border-radius:12px; border:1px solid rgba(0,0,0,0.03); box-shadow:0 6px 18px rgba(15,23,42,0.04); }
  `]
})
export class AdminProductsComponent implements OnInit {
  products: any[] = [];
  loading = false;
  q = '';
  section = '';
  processingId: string | null = null;

  page = 1;
  limit = 50;
  total = 0;

  constructor(
    private svc: AdminProductService,
    private router: Router,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.auth.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.load(true);
  }

  /**
   * Load products.
   * @param reset if true -> reset page to 1 and clear products
   */
  load(reset = true) {
    if (reset) {
      this.page = 1;
      this.products = [];
      this.total = 0;
    }

    this.loading = true;
    const params: any = {
      page: this.page,
      limit: this.limit,
      q: this.q || undefined,
      section: this.section || undefined
    };

    this.svc.list(params).subscribe({
      next: (res: any) => {
        const items = Array.isArray(res) ? res : (res.items ?? []);
        if (Array.isArray(items)) {
          this.products = [...this.products, ...items];
        } else {
          this.products = [];
        }

        if (res && typeof res.total === 'number') {
          this.total = res.total;
        } else {
          if (items.length < this.limit && this.page === 1) {
            this.total = items.length;
          } else if (items.length < this.limit) {
            this.total = this.products.length;
          } else {
            if (this.total === 0) this.total = this.products.length;
          }
        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || 'Failed to load products');
      }
    });
  }

  resetAndLoad() {
    this.limit = 50;
    this.load(true);
  }

  loadMore() {
    if (this.total && this.products.length >= this.total) return;
    this.page++;
    this.load(false);
  }

  showAll() {
    this.limit = 1000;
    this.load(true);
  }

  isLastPage() {
    if (!this.total) return false;
    return this.products.length >= this.total;
  }

  createNew() {
    this.router.navigate(['/admin/products/new']);
  }

  edit(id: string) {
    this.router.navigate(['/admin/products', id, 'edit']);
  }

  remove(id: string) {
    if (!confirm('Soft-delete this product?')) return;
    this.processingId = id;
    this.svc.softDelete(id).subscribe({
      next: () => {
        this.processingId = null;
        this.toast.success('Product soft-deleted');
        this.load(true);
      },
      error: (err) => {
        this.processingId = null;
        this.toast.error(err?.error?.message || 'Failed to delete');
      }
    });
  }

  getPhoto(p: any) {
    if (!p) return 'assets/no-image.png';
    const photo = p.photo ?? p.image ?? '';
    if (!photo) return 'assets/no-image.png';
    if (photo.startsWith('http') || photo.startsWith('//')) return photo;
    const origin = window.location.origin;
    return photo.startsWith('/') ? `${origin}${photo}` : `${origin}/${photo}`;
  }
}
