import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../services/report.service';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-shell">
      <header class="reports-head">
        <h2>Admin Reports</h2>
        <div class="controls-row">
          <div class="date-controls">
            <label>From
              <input type="date" [(ngModel)]="from" name="from" />
            </label>
            <label>To
              <input type="date" [(ngModel)]="to" name="to" />
            </label>

            <div class="presets">
              <button type="button" (click)="setRange('7d')">Last 7d</button>
              <button type="button" (click)="setRange('30d')">Last 30d</button>
              <button type="button" (click)="setRange('month')">This Month</button>
            </div>
          </div>

          <div class="query-controls">
            <label>Limit
              <input type="number" min="1" [(ngModel)]="limit" name="limit" />
            </label>

            <label>Sort
              <select [(ngModel)]="sortBy" name="sortBy">
                <option value="">Default</option>
                <option value="unitsSold_desc">Units Sold ↓</option>
                <option value="unitsSold_asc">Units Sold ↑</option>
                <option value="revenue_desc">Revenue ↓</option>
                <option value="revenue_asc">Revenue ↑</option>
              </select>
            </label>

            <label>Search
              <input type="text" [(ngModel)]="productQuery" placeholder="Product name" />
            </label>

            <button class="btn" (click)="load()" [disabled]="loading">Load</button>
            <button class="btn ghost" (click)="exportCsv()" [disabled]="!soldProducts.length">Export CSV</button>
          </div>
        </div>
      </header>

      <main class="reports-main">
        <div *ngIf="error" class="error">{{ error }}</div>

        <div *ngIf="loading" class="loading-overlay">
          <div class="spinner"></div>
        </div>

        <section class="summary-cards" *ngIf="report">
          <div class="card">
            <div class="card-title">Total Sales</div>
            <div class="card-value">{{ report.totalSales | number:'1.2-2' }}</div>
          </div>

          <div class="card">
            <div class="card-title">Orders</div>
            <div class="card-value">{{ report.ordersCount }}</div>
          </div>

          <div class="card">
            <div class="card-title">Period</div>
            <div class="card-value">{{ from }} → {{ to }}</div>
          </div>
        </section>

        <section *ngIf="soldProducts && soldProducts.length > 0" class="products-section">
          <h3>Top Sold Products ({{ soldProducts.length }})</h3>

          <div class="table-actions">
            <div>Showing page {{ currentPage }} / {{ totalPages }}</div>
            <div>
              <button (click)="prevPage()" [disabled]="currentPage <= 1">Prev</button>
              <button (click)="nextPage()" [disabled]="currentPage >= totalPages">Next</button>
            </div>
          </div>

          <table class="results-table">
            <thead>
              <tr>
                <th (click)="toggleSort('name')">Product</th>
                <th (click)="toggleSort('unitsSold')">Units Sold</th>
                <th (click)="toggleSort('revenue')">Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pagedProducts()">
                <td class="prod-name">{{ p.name }}</td>
                <td class="num">{{ p.unitsSold }}</td>
                <td class="num">{{ p.revenue | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <div *ngIf="!loading && (!soldProducts || soldProducts.length === 0) && !error" class="empty-state">
          No data to show. Choose a date range and press Load.
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display:block; font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color:#222; }
    .reports-shell { max-width:1100px; margin:18px auto; padding:12px; }
    .reports-head { display:flex; flex-direction:column; gap:12px; }
    h2 { margin:0 0 6px 0; font-size:20px; }

    .controls-row { display:flex; gap:12px; flex-wrap:wrap; align-items:flex-start; }
    .date-controls { display:flex; gap:10px; align-items:center; }
    .date-controls label { display:flex; flex-direction:column; font-size:13px; }
    .date-controls input { padding:6px 8px; border:1px solid #ddd; border-radius:6px; min-width:140px; }

    .presets { display:flex; gap:6px; margin-left:8px; }
    .presets button { padding:6px 8px; border-radius:6px; border:1px solid #ddd; background:#fff; cursor:pointer; }
    .presets button:hover { background:#f3f7ff; }

    .query-controls { margin-left:auto; display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .query-controls label { display:flex; flex-direction:column; font-size:13px; }
    .query-controls input, .query-controls select { padding:6px 8px; border:1px solid #ddd; border-radius:6px; min-width:120px; }

    .btn { padding:8px 12px; background:#1976d2; color:#fff; border:none; border-radius:6px; cursor:pointer; }
    .btn[disabled] { background:#9bbbe6; cursor:not-allowed; }
    .btn.ghost { background:transparent; color:#1976d2; border:1px solid #cce0ff; }

    .reports-main { position:relative; margin-top:16px; min-height:120px; }

    .loading-overlay {
      position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
      background: rgba(255,255,255,0.7); z-index:10;
    }
    .spinner {
      width:36px; height:36px; border-radius:50%; border:4px solid #eee; border-top-color:#1976d2; animation:spin 1s linear infinite;
    }
    @keyframes spin { to { transform:rotate(360deg);} }

    .error { color:#b00020; margin-bottom:12px; }

    .summary-cards { display:flex; gap:12px; margin-bottom:12px; flex-wrap:wrap; }
    .card { background:#fff; border:1px solid #eee; padding:12px; border-radius:8px; min-width:160px; box-shadow:0 1px 2px rgba(0,0,0,0.02); }
    .card-title { font-size:12px; color:#666; }
    .card-value { font-size:18px; font-weight:700; margin-top:6px; }

    .products-section h3 { margin-top:0; }

    .table-actions { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
    .results-table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #eee; border-radius:6px; overflow:hidden; }
    .results-table th, .results-table td { padding:10px 12px; border-bottom:1px solid #f3f3f3; text-align:left; }
    .results-table th { background:#fafafa; cursor:pointer; user-select:none; font-weight:600; }
    .results-table tr:hover td { background:#fafcff; }
    .prod-name { max-width:420px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .num { width:120px; text-align:right; }

    .empty-state { padding:18px; text-align:center; color:#666; }
    @media (max-width:920px) {
      .query-controls { width:100%; justify-content:flex-start; }
      .date-controls { width:100%; }
    }
  `]
})
export class ReportsComponent {
  from = '';
  to = '';
  limit = 10;
  loading = false;
  report: any = null;
  soldProducts: any[] = [];
  error = '';

  sortBy = '';
  productQuery = '';

  pageSize = 10;
  currentPage = 1;

  constructor(private reportSvc: ReportService) {}

  load() {
    this.error = '';
    if (!this.from || !this.to) {
      this.error = 'Please choose both From and To dates.';
      return;
    }

    const limitNum = Number(this.limit) || 10;
    this.loading = true;
    this.currentPage = 1;

    forkJoin({
      sales: this.reportSvc.getSales(this.from, this.to).pipe(
        catchError(err => { console.error('sales error', err); return of(null); })
      ),
      sold: this.reportSvc.getSoldProducts(this.from, this.to, limitNum).pipe(
        catchError(err => { console.error('sold-products error', err); return of({ results: [] }); })
      )
    }).pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          this.report = res.sales ?? null;
          this.soldProducts = (res.sold?.results ?? []).map((r: any) => ({
            name: r.name ?? r.productId ?? '—',
            unitsSold: Number(r.unitsSold ?? r.unitsSold ?? 0),
            revenue: Number(r.revenue ?? 0)
          }));
          this.applyClientFilters();
        },
        error: (err) => {
          console.error('reports overall error', err);
          this.error = 'Failed to load reports';
        }
      });
  }

  setRange(preset: '7d' | '30d' | 'month') {
    const now = new Date();
    let fromDate: Date;
    if (preset === '7d') {
      fromDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    } else if (preset === '30d') {
      fromDate = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    } else {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    this.from = fromDate.toISOString().slice(0, 10);
    this.to = toDate.toISOString().slice(0, 10);
  }

  applyClientFilters() {
    let arr = Array.isArray(this.soldProducts) ? [...this.soldProducts] : [];
    if (this.productQuery && this.productQuery.trim()) {
      const q = this.productQuery.trim().toLowerCase();
      arr = arr.filter(p => (p.name ?? '').toLowerCase().includes(q));
    }

    if (this.sortBy) {
      const [key, dir] = this.sortBy.split('_');
      arr.sort((a: any, b: any) => {
        const va = a[key] ?? 0;
        const vb = b[key] ?? 0;
        return (dir === 'asc' ? va - vb : vb - va);
      });
    }

    this.soldProducts = arr;
    this.currentPage = 1;
  }

  toggleSort(key: string) {
    const current = this.sortBy;
    if (current.startsWith(key) && current.endsWith('asc')) {
      this.sortBy = `${key}_desc`;
    } else if (current.startsWith(key) && current.endsWith('desc')) {
      this.sortBy = '';
    } else {
      this.sortBy = `${key}_asc`;
    }
    this.applyClientFilters();
  }

  pagedProducts() {
    const ps = this.pageSize;
    const start = (this.currentPage - 1) * ps;
    return this.soldProducts.slice(start, start + ps);
  }

  get totalPages() {
    return Math.max(1, Math.ceil((this.soldProducts.length || 0) / this.pageSize));
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  exportCsv() {
    if (!this.soldProducts || !this.soldProducts.length) return;
    const headers = ['Product', 'Units Sold', 'Revenue'];
    const rows = this.soldProducts.map(p => [p.name, String(p.unitsSold), String(p.revenue)]);
    const csv = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sold-products-${this.from}-${this.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
