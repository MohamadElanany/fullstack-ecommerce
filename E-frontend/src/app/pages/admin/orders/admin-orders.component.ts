import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminOrderService } from '../../../services/admin-order.service';
import { SpinnerComponent } from '../../../components/spinner.component';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, FormsModule, RouterModule, DatePipe],
  template: `
    <div class="admin-page">
      <h2>Admin — Orders</h2>

      <div class="filters">
        <input [(ngModel)]="q" placeholder="Search by user id / order id..." (keyup.enter)="load(true)" />
        <select [(ngModel)]="statusFilter" (change)="load(true)">
          <option value="">All statuses</option>
          <option *ngFor="let s of allowedStatuses" [value]="s">{{ s }}</option>
        </select>
        <button (click)="load(true)" [disabled]="loading">Search</button>
      </div>

      <div *ngIf="loading" class="loading">
        <app-spinner label="Loading..." size="default"></app-spinner>
      </div>

      <div class="table-container" *ngIf="!loading && orders.length>0">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>User</th>
              <th>Total</th>
              <th>Products</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of orders">
              <td>
                <div class="order-id">{{ o._id }}</div>
                <div class="order-date">{{ o.createdAt | date:'short' }}</div>
              </td>
              <td>
                <ng-container *ngIf="o.userId; else guest">
                  {{ o.userId.name }} ({{ o.userId.email }})
                </ng-container>
                <ng-template #guest>
                  Guest
                </ng-template>
              </td>
              <td>{{ o.totalPrice | currency:'USD':'symbol':'1.2-2' }}</td>
              <td>
                <div *ngFor="let p of o.products" class="product-item">
                  {{ p.name }} × {{ p.quantity }}
                </div>
                <div class="product-count">Total: {{ o.products.length }} items</div>
              </td>
              <td>
                <div *ngFor="let s of o.statusHistory" [ngClass]="'status '+s.status">
                  {{ s.status }} <small>({{ s.timestamp | date:'short' }})</small>
                </div>
              </td>
              <td>
                <select [(ngModel)]="selectedStatus[o._id]">
                  <option value="">-- change --</option>
                  <option *ngFor="let s of allowedStatuses" [value]="s">{{ s }}</option>
                </select>
                <button (click)="changeStatus(o._id)" [disabled]="changingId === o._id">Set</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && orders.length === 0" class="empty">
        No orders found.
      </div>
    </div>
  `,
  styles: [`
    .filters { display:flex; gap:8px; align-items:center; margin-bottom:12px }
    .filters input, .filters select { padding:6px; }
    .filters button { padding:6px 12px; cursor:pointer; }

    .table-container { overflow-x:auto; margin-top:8px; }

    .admin-table { width:100%; border-collapse:collapse; min-width:800px; }
    .admin-table th, .admin-table td { padding:10px; border-bottom:1px solid #eee; text-align:left; vertical-align:top; }

    .order-id { font-weight:bold; }
    .order-date { font-size:12px; color:#666; }

    .product-item { font-size:13px; }
    .product-count { font-size:12px; color:#444; margin-top:4px; }

    .status { padding:2px 6px; border-radius:4px; font-size:12px; margin-bottom:2px; display:inline-block; }
    .status.placed { background:#e3f2fd; color:#1565c0; }
    .status.processing { background:#fff3e0; color:#ef6c00; }
    .status.shipped { background:#e8f5e9; color:#2e7d32; }
    .status.delivered { background:#c8e6c9; color:#1b5e20; }
    .status.cancelled { background:#ffebee; color:#c62828; }

    button { margin-left:6px; padding:6px 12px; border:none; border-radius:4px; background:#1976d2; color:#fff; cursor:pointer; }
    button:hover { background:#1565c0; }
    button[disabled] { background:#ccc; cursor:not-allowed; }

    .loading, .empty { padding:12px; text-align:center; color:#666; }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = false;
  q = '';
  statusFilter = '';
  allowedStatuses = ['placed','processing','shipped','delivered','cancelled'];
  selectedStatus: Record<string,string> = {};
  changingId: string | null = null;

  constructor(
    private svc: AdminOrderService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load(true);
  }

  load(_reset: boolean = true) {
  this.loading = true;
  this.svc.list({}).subscribe({
    next: (res: any) => {
      let allOrders = res.orders ?? res;

      if (this.q) {
        const query = this.q.toLowerCase();
        allOrders = allOrders.filter((o: any) =>
          o._id.toLowerCase().includes(query) ||
          (o.userId?.name?.toLowerCase().includes(query)) ||
          (o.userId?.email?.toLowerCase().includes(query)) ||
          o.products.some((p: any) => p.name.toLowerCase().includes(query))
        );
      }

      if (this.statusFilter) {
        allOrders = allOrders.filter((o: any) =>
          o.statusHistory.some((s: any) => s.status === this.statusFilter)
        );
      }

      this.orders = allOrders;
      this.loading = false;
    },
    error: () => {
      this.loading = false;
    }
  });
}



  changeStatus(orderId: string) {
    const newStatus = this.selectedStatus[orderId];
    if (!newStatus) { this.toast.error('Select a status first'); return; }
    if (!confirm(`Change order ${orderId} status to "${newStatus}"?`)) return;

    this.changingId = orderId;
    this.svc.updateStatus(orderId, { status: newStatus }).subscribe({
      next: () => {
        this.changingId = null;
        this.toast.success('Status updated');
        this.load(true);
      },
      error: (err) => {
        this.changingId = null;
        this.toast.error(err?.error?.message || 'Failed to update status');
      }
    });
  }
}
