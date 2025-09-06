import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="orders-page">
      <h2>My Orders</h2>

      <div *ngIf="loading" class="loading">Loading orders...</div>

      <div *ngIf="!loading && orders.length === 0" class="empty">
        <p>No orders yet.</p>
        <a routerLink="/products" class="browse-link">Browse products</a>
      </div>

      <div *ngIf="!loading && orders.length > 0" class="orders-list">
        <div *ngFor="let o of orders" class="order-card">
          <div class="order-header">
            <div>
              <strong>Order #{{ o._id }}</strong>
              <div class="date">Created: {{ o.createdAt | date:'medium' }}</div>
            </div>
            <div class="order-meta">
              <div>Total: <strong>{{ o.totalPrice | number:'1.2-2' }}</strong></div>
              <div *ngIf="o.products?.length" class="items-count">
                {{ o.products.length }} item{{ o.products.length > 1 ? 's' : '' }}
              </div>
            </div>
          </div>

          <div class="order-status" *ngIf="o.statusHistory?.length">
            <span class="status" [ngClass]="o.statusHistory[o.statusHistory.length-1].status">
              {{ o.statusHistory[o.statusHistory.length-1].status }}
            </span>
          </div>

          <div class="order-actions">
            <button (click)="view(o._id)">View details</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-page { padding:16px; max-width:900px; margin:auto; }
    h2 { margin-bottom:16px; }
    .loading, .empty { padding:12px; text-align:center; color:#666; }
    .browse-link { color:#1976d2; text-decoration:none; }
    .browse-link:hover { text-decoration:underline; }
    .orders-list { display:flex; flex-direction:column; gap:12px; }
    .order-card { border:1px solid #eee; border-radius:8px; padding:12px; background:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.04); }
    .order-header { display:flex; justify-content:space-between; align-items:flex-start; }
    .date { font-size:13px; color:#666; }
    .order-meta { text-align:right; font-size:14px; }
    .items-count { color:#666; font-size:13px; margin-top:4px; }
    .order-status { margin-top:8px; }
    .status { padding:4px 10px; border-radius:12px; font-size:13px; font-weight:500; text-transform:capitalize; }
    .status.placed { background:#e3f2fd; color:#1565c0; }
    .status.processing { background:#fff3e0; color:#ef6c00; }
    .status.shipped { background:#e8f5e9; color:#2e7d32; }
    .status.delivered { background:#c8e6c9; color:#1b5e20; }
    .status.cancelled { background:#ffebee; color:#c62828; }
    .order-actions { margin-top:12px; text-align:right; }
    button { padding:6px 12px; border:none; border-radius:6px; background:#1976d2; color:#fff; cursor:pointer; font-size:14px; }
    button:hover { background:#1565c0; }
  `]
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading = false;

  constructor(private orderSvc: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.orderSvc.getOrders().subscribe({
      next: res => {
        this.orders = res?.orders ?? res ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to load orders', err);
        alert(err?.error?.message || 'Failed to load orders');
      }
    });
  }

  view(id: string) {
    this.router.navigate(['/orders', id]);
  }
}
