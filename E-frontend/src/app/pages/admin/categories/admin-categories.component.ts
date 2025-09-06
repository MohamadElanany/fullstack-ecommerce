import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../services/category.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';
import { RouterModule, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-shell">
      <div class="admin-header">
        <h2>Admin — Categories</h2>
        <button class="btn ghost" (click)="load()" [disabled]="loading">Refresh</button>
      </div>

      <div class="card form-inline">
        <input [(ngModel)]="newName" placeholder="New category name" />
        <select [(ngModel)]="newSection">
          <option value="mens">Mens</option>
          <option value="womens">Womens</option>
          <option value="unisex">Unisex</option>
        </select>
        <button class="btn primary" (click)="create()" [disabled]="creating">Create</button>
      </div>

      <div *ngIf="loading" class="card loading">Loading...</div>

      <ul *ngIf="!loading" class="list">
        <li *ngFor="let c of categories" class="item card">
          <div class="item-body">
            <div class="name">{{ c.name }}</div>
            <div class="muted small">Section: {{ c.section }}</div>
          </div>

          <div class="item-actions">
            <button class="btn ghost" (click)="edit(c._id)">Edit</button>
            <button class="btn danger" (click)="del(c._id)">Delete</button>
          </div>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .admin-shell { max-width:900px; margin:20px auto; padding:12px; }
    .admin-header { display:flex; align-items:center; margin-bottom:16px; }
    .admin-header h2 { flex:1; margin:0; }
    .card { background:#fff; border-radius:10px; padding:12px; border:1px solid #eee; box-shadow:0 6px 18px rgba(0,0,0,0.05); }
    .form-inline { display:flex; gap:8px; margin-bottom:16px; }
    .list { list-style:none; padding:0; margin:0; display:grid; gap:12px; }
    .item { display:flex; justify-content:space-between; align-items:center; padding:12px; }
    .name { font-weight:600; font-size:15px; }
    .small { font-size:13px; }
    .muted { color:#6b7280; }
    .item-actions { display:flex; gap:8px; }
    .btn { padding:6px 12px; border-radius:8px; border:none; cursor:pointer; font-weight:600; }
    .btn.primary { background:#0ea5a4; color:white; }
    .btn.ghost { background:transparent; border:1px solid #ddd; color:#374151; }
    .btn.danger { background:#dc2626; color:white; }
    .btn:disabled { opacity:0.6; cursor:not-allowed; }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  categories: any[] = [];
  loading = false;
  newName = '';
  newSection = 'mens';
  creating = false;

  constructor(
    private svc: CategoryService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.getCategories().subscribe({
      next: res => {
        this.categories = res.categories ?? res;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  create() {
    if (!this.newName.trim()) return this.toast.error('Name required');
    this.creating = true;
    this.svc.create({ name: this.newName.trim(), section: this.newSection }).subscribe({
      next: () => {
        this.creating = false;
        this.newName = '';
        this.toast.success('Created');
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.creating = false;
        this.toast.error(err?.error?.message || 'Failed');
      }
    });
  }

  edit(id: string) {
    this.router.navigate(['/admin/categories', id, 'edit']);
  }

  del(id: string) {
    if (!confirm('Delete this category?')) return;
    this.svc.delete(id).subscribe({
      next: () => {
        this.toast.success('Deleted');
        this.load();
      },
      error: (e: HttpErrorResponse) => {
        this.toast.error(e?.error?.message || 'Failed');
      }
    });
  }
}
