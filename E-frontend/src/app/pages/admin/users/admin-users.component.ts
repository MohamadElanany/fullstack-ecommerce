import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { RouterModule, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-page">
      <h2>Admin — Users</h2>

      <div *ngIf="loading" class="loading">Loading...</div>

      <div *ngIf="!loading && users.length === 0" class="empty">
        No users found.
      </div>

      <div class="table-container" *ngIf="!loading && users.length > 0">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>{{ u.name || '—' }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.role || 'user' }}</td>
              <td>
                <span [ngClass]="u.isActive ? 'active' : 'inactive'">
                  {{ u.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button class="btn-edit" (click)="edit(u)">Edit</button>
                <button class="btn-del" (click)="del(u._id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" *ngIf="!loading && total > users.length">
        <button (click)="load(page - 1)" [disabled]="page === 1">Prev</button>
        <span>Page {{ page }}</span>
        <button (click)="load(page + 1)" [disabled]="page * limit >= total">Next</button>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { padding:16px; }
    .loading, .empty { padding:12px; text-align:center; color:#666; }

    .table-container { overflow-x:auto; margin-top:12px; }
    .admin-table { width:100%; border-collapse:collapse; min-width:600px; }
    .admin-table th, .admin-table td {
      padding:10px; border-bottom:1px solid #eee; text-align:left;
    }

    .active { color:#2e7d32; font-weight:500; }
    .inactive { color:#c62828; font-weight:500; }

    button { padding:6px 12px; border:none; border-radius:4px; cursor:pointer; }
    .btn-edit { background:#1976d2; color:#fff; }
    .btn-edit:hover { background:#1565c0; }
    .btn-del { background:#e53935; color:#fff; margin-left:6px; }
    .btn-del:hover { background:#c62828; }

    .pagination { margin-top:12px; display:flex; gap:8px; justify-content:center; align-items:center; }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  loading = false;
  page = 1;
  limit = 10;
  total = 0;

  constructor(
    private svc: UserService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.load();
  }

  load(page: number = 1) {
    this.loading = true;
    this.page = page;
    this.svc.list({ page, limit: this.limit }).subscribe({
      next: res => {
        this.users = res.users || [];
        this.total = res.total || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load users');
      }
    });
  }

  edit(user: any) {
    if (!user || !user._id) {
      this.toast.error('User ID missing');
      return;
    }
    this.router.navigate(['/admin/users', user._id, 'edit'], { state: { user } });
  }

  del(id: string) {
    if (!confirm('Delete user?')) return;
    this.svc.delete(id).subscribe({
      next: res => {
        this.toast.success(res.message || 'Deleted');
        this.load(this.page);
      },
      error: e => this.toast.error(e?.error?.message || 'Failed to delete')
    });
  }
}
