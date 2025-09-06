import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-user-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="admin-page">
      <h2>Edit User</h2>

      <div *ngIf="loading" class="loading">Loading...</div>

      <form *ngIf="!loading && form" [formGroup]="form" (ngSubmit)="save()" class="form">
        <div class="form-group">
          <label>Name</label>
          <input type="text" formControlName="name" [disabled]=true />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input type="text" formControlName="email" [disabled]=true />
        </div>

        <div class="form-group">
          <label>Role</label>
          <select formControlName="role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" formControlName="isActive" />
            Active
          </label>
        </div>

        <div class="actions">
          <button type="submit" [disabled]="form.invalid">Save</button>
          <button type="button" (click)="cancel()" class="btn-cancel">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .admin-page { padding:16px; }
    .loading { padding:12px; text-align:center; color:#666; }
    .form { max-width:400px; display:flex; flex-direction:column; gap:12px; }
    .form-group { display:flex; flex-direction:column; }
    input, select { padding:8px; border:1px solid #ccc; border-radius:4px; }
    .actions { display:flex; gap:8px; }
    button { padding:8px 16px; border:none; border-radius:4px; cursor:pointer; }
    button[type="submit"] { background:#1976d2; color:#fff; }
    button[type="submit"]:hover { background:#1565c0; }
    .btn-cancel { background:#e53935; color:#fff; }
    .btn-cancel:hover { background:#c62828; }
  `]
})
export class AdminUserFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  userId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: UserService,
    private toast: ToastService
  ) {}

  ngOnInit() {
  const nav = history.state.user;
  if (nav) {
    this.userId = nav._id;
    this.initForm(nav);
  } else {
    this.toast.error('User data not found');
    this.router.navigate(['/admin/users']);
  }
}

initForm(user: any) {
  this.form = this.fb.group({
    name: [user.name],
    email: [user.email],
    role: [user.role || 'user', Validators.required],
    isActive: [user.isActive ?? true]
  });
}

save() {
  if (!this.form.valid) return;
  const { role, isActive } = this.form.value;
  this.svc.update(this.userId, { role, isActive }).subscribe({
    next: () => {
      this.toast.success('User updated');
      this.router.navigate(['/admin/users']);
    },
    error: e => this.toast.error(e?.error?.message || 'Failed to update user')
  });
}


  loadUser() {
    this.loading = true;
    this.svc.get(this.userId).subscribe({
      next: res => {
        const user = res.user ?? res;
        this.form = this.fb.group({
          name: [user.name],
          email: [user.email],
          role: [user.role || 'user', Validators.required],
          isActive: [user.isActive ?? true]
        });
        this.loading = false;
      },
      error: e => {
        this.toast.error(e?.error?.message || 'Failed to load user');
        this.loading = false;
      }
    });
  }


  cancel() {
    this.router.navigate(['/admin/users']);
  }
}
