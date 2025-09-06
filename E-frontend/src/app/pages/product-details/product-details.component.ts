import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div *ngIf="loading" class="center">Loading product...</div>
      <div *ngIf="!loading && !product" class="center">Product not found</div>

      <div *ngIf="product" class="card">
        <div class="media">
          <img *ngIf="product.photo" [src]="photoUrl(product.photo)" alt="{{product.name}}" />
        </div>
        <div class="info">
          <h2>{{ product.name }}</h2>
          <p *ngIf="product.description" class="desc">{{ product.description }}</p>
          <div class="price"><strong>{{ product.price | number:'1.2-2' }} USD</strong></div>
          <div class="stock">Stock: {{ product.stock || 0 }}</div>
          <div class="actions">
            <label>
              Qty:
              <input type="number" [(ngModel)]="quantity" min="1" />
            </label>
            <button (click)="addToCart()" [disabled]="adding || !product.stock">
              {{ adding ? 'Adding...' : 'Add to cart' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      display:flex;
      justify-content:center;
      padding:40px 20px;
    }
    .center {
      text-align:center;
      font-size:16px;
      color:#666;
    }
    .card {
      display:flex;
      flex-direction:row;
      gap:24px;
      max-width:900px;
      width:100%;
      background:#fff;
      border-radius:12px;
      box-shadow:0 4px 12px rgba(0,0,0,0.08);
      padding:20px;
    }
    .media img {
      width:380px;
      height:380px;
      object-fit:cover;
      border-radius:10px;
      border:1px solid #eee;
    }
    .info {
      flex:1;
      display:flex;
      flex-direction:column;
    }
    .info h2 {
      margin:0 0 10px;
      font-size:24px;
    }
    .desc {
      margin-bottom:16px;
      color:#444;
      line-height:1.4;
    }
    .price {
      font-size:20px;
      margin-bottom:6px;
      color:#2f86eb;
    }
    .stock {
      margin-bottom:16px;
      font-size:14px;
      color:#666;
    }
    .actions {
      display:flex;
      align-items:center;
      gap:12px;
    }
    input[type="number"] {
      width:70px;
      padding:6px;
      border:1px solid #ccc;
      border-radius:6px;
    }
    button {
      padding:10px 18px;
      border:none;
      border-radius:8px;
      background:#2f86eb;
      color:#fff;
      cursor:pointer;
      transition:0.2s ease;
    }
    button:hover:not([disabled]) {
      background:#246dcc;
    }
    button[disabled] {
      opacity:0.6;
      cursor:not-allowed;
    }
  `]
})
export class ProductDetailsComponent implements OnInit {
  product?: Product | null = null;
  loading = false;
  adding = false;
  quantity = 1;
  private backendBase = 'http://localhost:4000';

  constructor(
    private route: ActivatedRoute,
    private productSvc: ProductService,
    private cartSvc: CartService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.load(id);
  }

  load(id: string) {
    this.loading = true;
    this.productSvc.getProduct(id).subscribe({
      next: (res: any) => {
        this.product = res.product;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.product = null;
      }
    });
  }

  photoUrl(path?: string) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${this.backendBase}${path}`;
    return `${this.backendBase}/${path}`;
  }

  addToCart() {
    if (!this.product?._id) return;
    if (this.quantity < 1) return;

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.adding = true;
    this.cartSvc.addToCart(this.product._id, this.quantity).subscribe({
      next: () => {
        this.adding = false;
        this.toast.success('Added to cart');
        this.router.navigate(['/cart']);
      },
      error: (err: any) => {
        this.adding = false;
        this.toast.error(err?.error?.message || 'Failed to add to cart');
      }
    });
  }
}
