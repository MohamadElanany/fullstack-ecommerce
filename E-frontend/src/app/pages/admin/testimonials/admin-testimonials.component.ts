import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialService } from '../../../services/testimonial.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-testimonials',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-shell">
      <div class="admin-header">
        <h2>Admin — Testimonials</h2>
        <div class="header-actions">
          <button class="btn ghost" (click)="load()" [disabled]="loading">Refresh</button>
        </div>
      </div>

      <div *ngIf="loading" class="card loading">Loading...</div>

      <div *ngIf="!loading && items.length === 0" class="card">No testimonials.</div>

      <ul *ngIf="!loading" class="list">
        <li *ngFor="let t of items" class="item card">
          <div class="item-body">
            <div class="text">{{ t.text }}</div>

            <div class="meta">
              <div class="small muted">User: {{ t.userId || '—' }} • {{ t.createdAt | date:'short' }}</div>

              <div class="status-wrap">
                <span class="chip" [ngClass]="{
                    'chip-approved': t.isApproved === true,
                    'chip-seen'    : t.isApproved === false && t.dateIsSeen,
                    'chip-pending' : t.isApproved == null || (t.isApproved === false && !t.dateIsSeen)
                  }">
                  {{ getStatusLabel(t) }}
                </span>

                <ng-container *ngIf="t.dateIsSeen">
                  <span class="seen small">• Seen: {{ t.dateIsSeen | date:'short' }}</span>
                </ng-container>
              </div>
            </div>
          </div>

          <div class="item-actions">
            <button class="btn primary" (click)="approve(t._id)" [disabled]="processing === t._id || t.isApproved === true">
              Approve
            </button>
            <button class="btn ghost" (click)="reject(t._id)" [disabled]="processing === t._id">
              Reject
            </button>
          </div>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .admin-shell { max-width: 980px; margin: 20px auto; padding: 12px; }
    .admin-header { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
    .header-actions { margin-left:auto; }
    .card { background:#fff; border-radius:10px; padding:12px; border:1px solid #eee; box-shadow: 0 6px 18px rgba(15,23,42,0.03); }
    .loading { text-align:center; }

    .list { list-style:none; padding:0; margin:0; display:grid; gap:10px; }
    .item { display:flex; justify-content:space-between; align-items:flex-start; padding:12px; border-radius:8px; }
    .item-body { flex:1; margin-right:12px; }
    .text { font-size:15px; margin-bottom:8px; }
    .meta { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
    .small { font-size:13px; color:#6b7280; }
    .muted { color:#6b7280; }

    .status-wrap { display:flex; align-items:center; gap:8px; }

    .chip { display:inline-block; padding:6px 10px; border-radius:999px; font-weight:700; font-size:13px; }
    .chip-approved { background:#ecfdf5; color:#065f46; }
    .chip-seen { background:#eff6ff; color:#1e3a8a; }
    .chip-pending { background:#fff7ed; color:#92400e; }

    .seen { color:#374151; font-size:13px; margin-left:6px; }

    .item-actions { display:flex; gap:8px; align-items:center; }
    .btn { padding:8px 12px; border-radius:8px; border:none; cursor:pointer; font-weight:700; }
    .btn.primary { background:#0ea5a4; color:white; }
    .btn.ghost { background:transparent; border:1px solid #e6e6e6; color:#374151; }
    .btn:disabled { opacity:0.6; cursor:not-allowed; }
  `]
})
export class AdminTestimonialsComponent implements OnInit {
  items: any[] = [];
  loading = false;
  processing: string | null = null;

  constructor(private svc: TestimonialService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.listAllAdmin().subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.items = res;
        } else if (res && Array.isArray(res.testimonials)) {
          this.items = res.testimonials;
        } else if (res && Array.isArray(res.items)) {
          this.items = res.items;
        } else if (res && Array.isArray(res.data)) {
          this.items = res.data;
        } else {
          this.items = [];
        }
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        console.error('Failed to load testimonials', err);
        this.toast.error(err?.error?.message || 'Failed to load testimonials');
      }
    });
  }

  getStatusLabel(t: any): string {
    if (t.isApproved === true) return 'Approved';
    if (t.isApproved === false && t.dateIsSeen) return 'Seen (Pending)';
    return 'Pending';
  }

  approve(id: string) {
    this.processing = id;
    this.svc.approve(id, true).subscribe({
      next: () => {
        this.processing = null;
        this.toast.success('Approved');
        this.markLocalApproved(id);
      },
      error: e => {
        this.processing = null;
        console.error('Approve error', e);
        this.toast.error(e?.error?.message || 'Failed to approve');
      }
    });
  }

  reject(id: string) {
    if (!confirm('Reject testimonial?')) return;
    this.processing = id;
    this.svc.approve(id, false).subscribe({
      next: () => {
        this.processing = null;
        this.toast.success('Rejected');
        this.removeLocal(id);
      },
      error: e => {
        this.processing = null;
        console.error('Reject error', e);
        this.toast.error(e?.error?.message || 'Failed to reject');
      }
    });
  }

  private markLocalApproved(id: string) {
    const idx = this.items.findIndex(x => x._id === id);
    if (idx >= 0) {
      this.items[idx].isApproved = true;
      this.items[idx].dateIsSeen = new Date().toISOString();
    }
  }

  private removeLocal(id: string) {
    this.items = this.items.filter(x => x._id !== id);
  }
}
