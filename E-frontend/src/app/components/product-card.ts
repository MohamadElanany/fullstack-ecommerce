import { Component, Input } from '@angular/core';
import { Product } from '../models/product';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';
import { SpinnerComponent } from './spinner.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  template: `
    <div class="card">
      <a [routerLink]="['/products', product._id]" style="display:block;text-decoration:none;color:inherit">
        <img *ngIf="product.photo" [src]="photoUrl(product.photo)" alt="{{product.name}}" style="width:100%;height:180px;object-fit:cover" />
      </a>

      <div class="card-body">
        <h4><a [routerLink]="['/products', product._id]" style="text-decoration:none;color:inherit">{{ product.name }}</a></h4>
        <p *ngIf="product.description">{{ product.description | slice:0:120 }}...</p>
        <div><strong>{{ product.price | number:'1.2-2' }} </strong></div>

        <button (click)="addToCart()" [disabled]="adding || product.stock===0" [attr.aria-busy]="adding">
          <app-spinner *ngIf="adding" size="small"></app-spinner>
          <span *ngIf="!adding">{{ product.stock === 0 ? 'Out of stock' : 'Add to cart' }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .card { border:1px solid #eee; border-radius:8px; overflow:hidden; }
    .card-body { padding:12px; }
    button { padding:8px 12px; border-radius:6px; border:0; background:#2f86eb; color:#fff; cursor:pointer; }
    button[disabled] { opacity:0.6; cursor:not-allowed; }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  adding = false;
  private backendBase = 'http://localhost:4000';

  constructor(
    private auth: AuthService,
    private cart: CartService,
    private toast: ToastService,
    private router: Router
  ) {}

  photoUrl(path?: string) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${this.backendBase}${path}`;
    return `${this.backendBase}/${path}`;
  }

  addToCart() {
    if (!this.auth.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.adding = true;
    this.cart.addToCart(this.product._id, 1).subscribe({
      next: () => {
        this.adding = false;
        this.toast.success('Added to cart');
      },
      error: (err) => {
        this.adding = false;
        const msg = err?.error?.message || 'Failed to add to cart';
        this.toast.error(msg);
      }
    });
  }
}
