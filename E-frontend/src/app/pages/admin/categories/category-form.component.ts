import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="admin-shell">
      <h2>{{ isEdit ? 'Edit Category' : 'Add Category' }}</h2>

      <form [formGroup]="form" (ngSubmit)="submit()" class="card form">
        <div class="form-field">
          <label>Name</label>
          <input formControlName="name" placeholder="Category name" />
        </div>

        <div class="form-field">
          <label>Section</label>
          <select formControlName="section">
            <option value="mens">Mens</option>
            <option value="womens">Womens</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>

        <div class="actions">
          <button class="btn primary" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
          </button>
          <button class="btn ghost" type="button" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .admin-shell { max-width:700px; margin:20px auto; padding:12px; }
    .card { background:#fff; border-radius:10px; padding:16px; border:1px solid #eee; box-shadow:0 6px 18px rgba(0,0,0,0.05); }
    .form { display:grid; gap:16px; }
    .form-field { display:grid; gap:6px; }
    label { font-weight:600; font-size:14px; }
    input, select { padding:8px; border-radius:8px; border:1px solid #ddd; }
    .actions { display:flex; gap:10px; }
    .btn { padding:8px 14px; border-radius:8px; border:none; cursor:pointer; font-weight:600; }
    .btn.primary { background:#0ea5a4; color:white; }
    .btn.ghost { background:transparent; border:1px solid #ddd; color:#374151; }
    .btn:disabled { opacity:0.6; cursor:not-allowed; }
  `]
})
export class CategoryFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  isEdit = false;
  id: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: CategoryService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      section: ['', Validators.required]
    });

    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.isEdit = true;
      this.loadCategory(this.id);
    }
  }

  loadCategory(id: string) {
    this.loading = true;
    this.svc.getCategory(id).subscribe({
      next: (res: any) => {
        this.form.patchValue(res.category || res);
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load category');
        this.loading = false;
      }
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const payload = this.form.value;

    if (this.isEdit && this.id) {
      this.svc.update(this.id, payload).subscribe({
        next: () => {
          this.toast.success('Category updated');
          this.router.navigate(['/admin/categories']);
        },
        error: () => {
          this.toast.error('Update failed');
          this.loading = false;
        }
      });
    } else {
      this.svc.create(payload).subscribe({
        next: () => {
          this.toast.success('Category created');
          this.router.navigate(['/admin/categories']);
        },
        error: () => {
          this.toast.error('Create failed');
          this.loading = false;
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/admin/categories']);
  }
}
