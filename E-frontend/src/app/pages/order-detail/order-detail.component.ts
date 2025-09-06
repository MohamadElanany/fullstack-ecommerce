import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { SpinnerComponent } from '../../components/spinner.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  template: `
    <div *ngIf="loading" class="loading">
      <app-spinner label="Loading..." size="default"></app-spinner>
    </div>

    <div *ngIf="!loading && !order" class="empty">
      <p>Order not found.</p>
      <a routerLink="/orders">Back to orders</a>
    </div>

    <div *ngIf="order" class="order-detail">
      <h2>Order #{{ order._id }}</h2>
      <div><strong>Date:</strong> {{ order.createdAt | date:'medium' }}</div>
      <div><strong>Total:</strong> {{ order.totalPrice | number:'1.2-2' }}</div>

      <h3>Products</h3>
      <table *ngIf="order.products?.length" class="order-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of order.products">
            <td>
              <div class="product-cell">
                <img *ngIf="p.photo" [src]="p.photo" alt="{{ p.name }}" class="product-photo" />
                <div>
                  <div><strong>{{ p.name }}</strong></div>
                  <div class="desc" *ngIf="p.description">{{ p.description | slice:0:60 }}{{ p.description?.length > 60 ? '...' : '' }}</div>
                </div>
              </div>
            </td>
            <td>{{ p.price | number:'1.2-2' }}</td>
            <td>{{ p.quantity }}</td>
            <td>{{ (p.price * p.quantity) | number:'1.2-2' }}</td>
          </tr>
        </tbody>
      </table>

      <h3>Status History</h3>
      <ul class="status-list">
        <li *ngFor="let s of order.statusHistory" [ngClass]="'status ' + s.status">
          <strong>{{ s.status }}</strong> — {{ s.timestamp | date:'medium' }}
          <span *ngIf="s.adminId"> (by admin: {{ s.adminId }})</span>
        </li>
      </ul>

      <div *ngIf="order.cancellationReason" class="cancel-reason">
        <strong>Cancellation Reason:</strong> {{ order.cancellationReason }}
      </div>

      <div class="actions">
        <button (click)="back()">Back to orders</button>
      </div>
    </div>
  `,
  styles: [`
    .loading, .empty { padding:12px; text-align:center; color:#666; }
    .order-detail { padding:16px; max-width:900px; margin:auto; }
    .order-table { width:100%; border-collapse:collapse; margin-top:8px; }
    .order-table th, .order-table td { padding:10px; border-bottom:1px solid #eee; text-align:left; }
    .order-table th { background:#f9f9f9; }
    .product-cell { display:flex; gap:8px; align-items:flex-start; }
    .product-photo { width:50px; height:50px; object-fit:cover; border:1px solid #eee; border-radius:4px; }
    .desc { font-size:12px; color:#666; }
    .status-list { list-style:none; padding:0; margin:8px 0; }
    .status-list li { margin-bottom:4px; padding:4px 8px; border-radius:4px; font-size:14px; display:inline-block; }
    .status.placed { background:#e3f2fd; color:#1565c0; }
    .status.processing { background:#fff3e0; color:#ef6c00; }
    .status.shipped { background:#e8f5e9; color:#2e7d32; }
    .status.delivered { background:#c8e6c9; color:#1b5e20; }
    .status.cancelled { background:#ffebee; color:#c62828; }
    .cancel-reason { margin-top:12px; color:#b71c1c; }
    .actions { margin-top:16px; }
    button { padding:8px 14px; border:none; border-radius:6px; background:#1976d2; color:#fff; cursor:pointer; }
    button:hover { background:#1565c0; }
  `]
})
export class OrderDetailComponent implements OnInit {
  order: any = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private orderSvc: OrderService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/orders']);
      return;
    }
    this.load(id);
  }

  load(id: string) {
    this.loading = true;
    this.orderSvc.getOrder(id).subscribe({
      next: (res:any) => {
        this.order = res?.order ?? res ?? null;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || 'Failed to load order');
      }
    });
  }

  back() {
    this.router.navigate(['/orders']);
  }
}
