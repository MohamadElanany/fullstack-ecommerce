import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../../services/contact.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-contact-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-shell">
      <div class="admin-header">
        <h2>Admin — Contact Messages</h2>
        <div class="header-actions">
          <button class="btn ghost" (click)="load()" [disabled]="loading">Refresh</button>
        </div>
      </div>

      <div *ngIf="loading" class="card loading">Loading...</div>

      <div *ngIf="!loading && msgs.length === 0" class="card">No messages.</div>

      <ul *ngIf="!loading" class="list">
        <li *ngFor="let m of msgs" class="item card">
          <div class="item-body">
            <div class="subject">
              <strong>{{ m.category | titlecase }}</strong>
              <span class="muted"> — {{ m.message }}</span>
            </div>

            <div class="meta small muted">
              From: {{ m.userId || 'guest' }} • {{ m.createdAt | date:'short' }}
              <span class="status" [ngClass]="m.isSeen ? 'seen' : 'not-seen'">• {{ m.isSeen ? 'Seen' : 'Not seen' }}</span>
            </div>

            <div *ngIf="m.dateIsSeen" class="small muted">Seen at: {{ m.dateIsSeen | date:'short' }}</div>
          </div>

          <div class="item-actions">
            <button class="btn primary" (click)="markSeen(m._id)" [disabled]="processing === m._id || m.isSeen">
              Mark seen
            </button>
          </div>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .admin-shell { max-width:980px; margin:20px auto; padding:12px; }
    .admin-header { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
    .header-actions { margin-left:auto; }

    .card { background:#fff; border-radius:10px; padding:12px; border:1px solid #eee; box-shadow:0 6px 18px rgba(15,23,42,0.03); }
    .loading { text-align:center; }

    .list { list-style:none; padding:0; margin:0; display:grid; gap:10px; }
    .item { display:flex; justify-content:space-between; align-items:flex-start; padding:12px; border-radius:8px; }
    .item-body { flex:1; margin-right:12px; }
    .subject { font-size:15px; margin-bottom:8px; }
    .meta { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:6px; }
    .small { font-size:13px; color:#6b7280; }
    .muted { color:#6b7280; }

    .status { margin-left:6px; font-weight:700; }
    .status.seen { color: #065f46; }       /* green */
    .status.not-seen { color: #6b7280; }   /* gray */

    .item-actions { display:flex; gap:8px; align-items:center; }

    .btn { padding:8px 12px; border-radius:8px; border:none; cursor:pointer; font-weight:700; }
    .btn.primary { background:#0ea5a4; color:white; }
    .btn.ghost { background:transparent; border:1px solid #e6e6e6; color:#374151; }
    .btn:disabled { opacity:0.6; cursor:not-allowed; }
  `]
})
export class AdminContactMessagesComponent implements OnInit {
  msgs: any[] = [];
  loading = false;
  processing: string | null = null;

  constructor(private svc: ContactService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.listMessages().subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.msgs = res;
        } else if (res && Array.isArray(res.messages)) {
          this.msgs = res.messages;
        } else if (res && Array.isArray(res.items)) {
          this.msgs = res.items;
        } else if (res && Array.isArray(res.data)) {
          this.msgs = res.data;
        } else {
          this.msgs = [];
        }
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        console.error('Failed to load messages', err);
        this.toast.error(err?.error?.message || 'Failed to load messages');
      }
    });
  }

  markSeen(id: string) {
    if (!id) return;
    if (this.processing) return;

    this.processing = id;
    this.svc.markSeen(id).subscribe({
      next: (res: any) => {
        this.processing = null;
        this.toast.success('Marked as seen');

        const idx = this.msgs.findIndex(m => m._id === id);
        if (idx > -1) {
          this.msgs[idx].isSeen = true;
          if (res && res.dateIsSeen) this.msgs[idx].dateIsSeen = res.dateIsSeen;
          else this.msgs[idx].dateIsSeen = new Date().toISOString();
        } else {
          this.load();
        }
      },
      error: e => {
        this.processing = null;
        console.error('Mark seen error', e);
        this.toast.error(e?.error?.message || 'Failed to mark seen');
      }
    });
  }
}
