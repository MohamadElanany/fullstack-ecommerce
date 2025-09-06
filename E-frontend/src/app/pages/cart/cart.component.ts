import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../../components/spinner.component';
import { ProductService } from '../../services/product.service';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  template: `
    <h2>Your Cart</h2>

    <div *ngIf="loading" style="padding:12px">
      <app-spinner label="Loading..." size="default"></app-spinner>
    </div>

    <div *ngIf="!loading && (!cart || (cart.products?.length || 0) === 0)">
      <p>Your cart is empty.</p>
      <a routerLink="/products">Browse products</a>
    </div>

    <table *ngIf="!loading && cart && (cart.products?.length || 0) > 0" class="cart-table">
      <thead>
        <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of cart.products">
          <td>
            <div style="display:flex;gap:8px;align-items:center">
              <img *ngIf="productPhoto(p)" [src]="productPhoto(p)" alt="{{productName(p)}}" style="width:60px;height:60px;object-fit:cover;border:1px solid #eee" />
              <div>
                <div><strong>{{ productName(p) }}</strong></div>
                <div *ngIf="productDesc(p)" style="font-size:12px;color:#666">
                  {{ productDesc(p) | slice:0:80 }}{{ productDesc(p)?.length > 80 ? '...' : '' }}
                </div>
              </div>
            </div>
          </td>
          <td>{{ productPrice(p) | number:'1.2-2' }}</td>
          <td>
            <input type="number"
                    [(ngModel)]="p.quantity"
                    (change)="updateQty(getProductId(p), p.quantity)"
                    min="0"
                    style="width:64px"
                    [disabled]="processingItemId === getProductId(p)" />
          </td>
          <td>{{ (productPrice(p) * (p.quantity||0)) | number:'1.2-2' }}</td>
          <td>
            <button (click)="remove(getProductId(p))" [disabled]="processingItemId === getProductId(p)">
              <app-spinner *ngIf="processingItemId === getProductId(p)" size="small"></app-spinner>
              <span *ngIf="processingItemId !== getProductId(p)">Remove</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Price changes panel -->
    <div *ngIf="priceDiffs?.length" style="margin-top:12px;border:1px solid #ffd; background:#fff9e6;padding:12px;border-radius:6px">
      <h3 style="margin:0 0 8px">Price changes detected</h3>
      <p style="margin:0 0 8px">Some product prices changed since you added them to the cart. Review below before checkout.</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
        <thead>
          <tr style="text-align:left">
            <th style="padding:6px;border-bottom:1px solid #eee">Product</th>
            <th style="padding:6px;border-bottom:1px solid #eee">Your Price</th>
            <th style="padding:6px;border-bottom:1px solid #eee">Current Price</th>
            <th style="padding:6px;border-bottom:1px solid #eee">Diff</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of priceDiffs">
            <td style="padding:6px;border-bottom:1px solid #f5f5f5">{{ d.name }}</td>
            <td style="padding:6px;border-bottom:1px solid #f5f5f5">{{ d.oldPrice | number:'1.2-2' }}</td>
            <td style="padding:6px;border-bottom:1px solid #f5f5f5">{{ d.newPrice | number:'1.2-2' }}</td>
            <td style="padding:6px;border-bottom:1px solid #f5f5f5">{{ (d.newPrice - d.oldPrice) | number:'1.2-2' }}</td>
          </tr>
        </tbody>
      </table>

      <div style="display:flex;gap:8px">
        <button (click)="proceedWithUpdatedPrices()" style="background:#2f86eb;color:#fff;padding:8px 12px;border:0;border-radius:6px" [disabled]="checkingOut">
          {{ checkingOut ? 'Processing...' : 'Proceed with updated prices' }}
        </button>

        <button (click)="removeChangedItems()" style="background:#f44336;color:#fff;padding:8px 12px;border:0;border-radius:6px" [disabled]="removing">
          {{ removing ? 'Removing...' : 'Remove changed items' }}
        </button>

        <button (click)="clearPriceDiffs()" style="background:#eee;padding:8px 12px;border:0;border-radius:6px">Cancel</button>
      </div>
    </div>

    <div *ngIf="!loading && cart && (cart.products?.length || 0) > 0" style="margin-top:12px">
      <div><strong>Total: {{ total | number:'1.2-2' }}</strong></div>
      <button (click)="onCheckout()" [disabled]="checkingOut" [attr.aria-busy]="checkingOut" style="margin-top:8px;padding:8px 14px;border-radius:6px;background:#2f86eb;color:#fff;border:0">
        <app-spinner *ngIf="checkingOut" size="small"></app-spinner>
        <span *ngIf="!checkingOut">Checkout</span>
      </button>
      <div *ngIf="error" style="color:red;margin-top:8px">{{ error }}</div>
    </div>
  `,
  styles: [`
    .cart-table { width:100%; border-collapse:collapse; }
    .cart-table th, .cart-table td { padding:8px; border-bottom:1px solid #eee; text-align:left; vertical-align:middle; }
    button { padding:6px 10px; border-radius:6px; border:0; background:#2f86eb; color:#fff; cursor:pointer; }
    button[disabled] { opacity:0.65; cursor:not-allowed; }
  `]
})
export class CartComponent implements OnInit {
  cart: any = null;
  loading = false;
  checkingOut = false;
  error = '';
  total = 0;
  processingItemId: string | null = null;
  private backendBase = 'http://localhost:4000';

  // price diffs list
  priceDiffs: Array<{ productId: string; name: string; oldPrice: number; newPrice: number }> = [];
  removing = false;

  constructor(
    private cartSvc: CartService,
    private router: Router,
    private orderSvc: OrderService,
    private toast: ToastService,
    private productSvc: ProductService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.cartSvc.getCart().subscribe({
      next: (res: any) => {
        this.cart = res?.cart ?? res;
        this.computeTotal();
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const msg = err?.error?.message || 'Failed to load cart';
        this.error = msg;
        this.toast.error(msg);
      }
    });
  }

  getProductId(p: any) {
    if (!p) return null;
    return typeof p.productId === 'string' ? p.productId : p.productId?._id ?? null;
  }

  productName(p: any) {
    if (!p) return '';
    if (typeof p.productId === 'string') return `Product #${p.productId}`;
    return p.productId?.name || `Product #${p.productId?._id || ''}`;
  }

  productDesc(p: any) {
    if (!p) return '';
    return typeof p.productId === 'string' ? '' : p.productId?.description || '';
  }

  productPrice(p: any) {
    if (!p) return 0;
    if (typeof p.productId === 'string') return Number(p.price || 0);
    return Number(p.productId?.price || p.price || 0);
  }

  productPhoto(p: any) {
    const photo = (typeof p.productId === 'string') ? null : p.productId?.photo || null;
    if (!photo) return '';
    if (photo.startsWith('http')) return photo;
    if (photo.startsWith('/')) return `${this.backendBase}${photo}`;
    return `${this.backendBase}/${photo}`;
  }

  computeTotal() {
    this.total = (this.cart?.products || []).reduce((sum: number, p: any) => {
      const price = Number(this.productPrice(p) || 0);
      const qty = Number(p.quantity || 0);
      return sum + (price * qty);
    }, 0);
  }

  updateQty(productId: string | null, quantity: number) {
    if (!productId) return;
    if (quantity <= 0) { this.remove(productId); return; }
    this.processingItemId = productId;
    this.cartSvc.update(productId, quantity).subscribe({
      next: () => { this.processingItemId = null; this.load(); },
      error: (err: HttpErrorResponse) => {
        this.processingItemId = null;
        const msg = err?.error?.message || 'Failed to update';
        this.toast.error(msg);
        this.error = msg;
      }
    });
  }

  remove(productId: string | null) {
    if (!productId) return;
    this.processingItemId = productId;
    this.cartSvc.remove(productId).subscribe({
      next: () => { this.processingItemId = null; this.load(); },
      error: (err: HttpErrorResponse) => {
        this.processingItemId = null;
        const msg = err?.error?.message || 'Failed to remove';
        this.toast.error(msg);
        this.error = msg;
      }
    });
  }

  //checkout flow: first check current product prices from backend if any differences: show priceDiffs panel so user can choose otherwise call createOrder()
  onCheckout() {
    this.error = '';
    if (!this.cart || !Array.isArray(this.cart.products) || this.cart.products.length === 0) {
      this.toast.error('Cart is empty');
      return;
    }

    this.checkingOut = true;
    this.priceDiffs = [];

    const requests = this.cart.products.map((p: any) => {
      const id = this.getProductId(p);
      if (!id) return of(null);
      return this.productSvc.getProduct(id).pipe(
        catchError(err => of(null))
      );
    });

    forkJoin(requests).pipe(
  finalize(() => { this.checkingOut = false; })
).subscribe(
  (results: any) => {
    const arr = Array.isArray(results) ? results : [];
    const diffs: any[] = [];

    for (let i = 0; i < this.cart.products.length; i++) {
      const cartItem = this.cart.products[i];
      const id = this.getProductId(cartItem);
      const localPrice = Number(this.productPrice(cartItem) || 0);

      const fetched = arr[i];
      const fetchedProduct = fetched ? (fetched.product ?? fetched) : null;

      if (!fetchedProduct) {
        // product deleted or not found
        diffs.push({
          productId: id,
          name: this.productName(cartItem),
          oldPrice: localPrice,
          newPrice: 0
        });
        continue;
      }

      const currentPrice = Number(fetchedProduct.price ?? 0);
      if (Math.abs(currentPrice - localPrice) > 1e-6) {
        diffs.push({
          productId: id,
          name: fetchedProduct.name ?? this.productName(cartItem),
          oldPrice: localPrice,
          newPrice: currentPrice
        });
      }
    }

    if (diffs.length) {
      this.priceDiffs = diffs;
      this.toast.error('Price changes detected. Please review before checkout.');
      return;
    }

    this.createOrderConfirmed();
  },
  (err: any) => {
    console.error('Price check failed', err);
    this.toast.error('Failed to verify product prices');
  }
);
  }


  proceedWithUpdatedPrices() {
    if (!confirm('Proceed to place order using the updated prices?')) return;
    this.checkingOut = true;
    this.priceDiffs = [];
    this.createOrderConfirmed();
  }


  removeChangedItems() {
    if (!this.priceDiffs.length) return;
    if (!confirm('Remove these changed items from your cart?')) return;
    this.removing = true;

    const removes = this.priceDiffs.map(d => {
      return this.cartSvc.remove(d.productId).pipe(catchError(e => of(null)));
    });

    forkJoin(removes).pipe(finalize(() => { this.removing = false; })).subscribe({
      next: () => {
        this.toast.success('Removed changed items');
        this.clearPriceDiffs();
        this.load();
      },
      error: (e) => {
        console.error('Failed removing changed items', e);
        this.toast.error('Failed to remove some items');
      }
    });
  }

  clearPriceDiffs() {
    this.priceDiffs = [];
  }


  createOrderConfirmed() {
    this.checkingOut = true;
    this.orderSvc.createOrder().pipe(finalize(() => { this.checkingOut = false; })).subscribe({
      next: (res: any) => {
        this.toast.success('Order placed successfully!');

        this.router.navigate(['/orders']);
      },
      error: (err: any) => {
        console.error('Checkout failed', err);
        const msg = err?.error?.message || 'Checkout failed';
        this.toast.error(msg);
        
      }
    });
  }
}
