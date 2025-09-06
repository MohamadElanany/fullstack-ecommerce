import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AdminProductService } from '../../../services/admin-product.service';
import { CategoryService, Category } from '../../../services/category.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { SpinnerComponent } from '../../../components/spinner.component';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SpinnerComponent],
  template: `
    <div class="apf-shell">
      <div class="apf-card">
        <h2 class="apf-title">{{ isEdit ? 'Edit product' : 'Create product' }}</h2>
        <p class="apf-sub muted">{{ isEdit ? 'Edit product details' : 'Create a new product' }}</p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="apf-grid">
            <section class="apf-main">
              <div class="apf-field">
                <label>Name <span class="required">*</span></label>
                <input class="apf-input" formControlName="name" aria-required="true" />
                <div *ngIf="nameCtrl?.invalid && (nameCtrl?.touched || form.touched)" class="apf-error">
                  Name is required
                </div>
              </div>

              <div class="apf-row">
                <div style="flex:1" class="apf-field">
                  <label>Price <span class="required">*</span></label>
                  <input class="apf-input" type="number" formControlName="price" min="0" />
                </div>

                <div style="width:120px" class="apf-field">
                  <label>Stock</label>
                  <input class="apf-input" type="number" formControlName="stock" min="0" />
                </div>
              </div>

              <div class="apf-field">
                <label>Section</label>
                <select class="apf-input" formControlName="section">
                  <option value="mens">mens</option>
                  <option value="womens">womens</option>
                  <option value="unisex">unisex</option>
                </select>
              </div>

              <div class="apf-field">
                <label>Category</label>
                <select class="apf-input" formControlName="categoryId">
                  <option value="">— None —</option>
                  <option *ngFor="let c of categories" [value]="c._id">{{ c.name }} <span class="muted">({{ c.section }})</span></option>
                </select>
                <div *ngIf="categories.length === 0" class="apf-help muted">No categories for the selected section.</div>
              </div>

              <div class="apf-field">
                <label>Description</label>
                <textarea class="apf-input" formControlName="description"></textarea>
              </div>

              <div class="apf-actions">
                <button class="btn primary" type="submit" [disabled]="saving || form.invalid" aria-disabled="{{ saving || form.invalid }}">
                  <app-spinner *ngIf="saving" size="small"></app-spinner>
                  <span *ngIf="!saving">{{ isEdit ? 'Update' : 'Create' }}</span>
                </button>

                <button type="button" class="btn ghost" (click)="cancel()" [disabled]="saving">Cancel</button>

                <div *ngIf="saving" class="muted small">Saving...</div>
              </div>
            </section>

            <aside class="apf-side">
              <div class="apf-field">
                <label>Photo</label>
                <input type="file" (change)="onFile($event)" accept="image/*" />
              </div>

              <div class="apf-preview-wrap">
                <img *ngIf="preview" [src]="preview" class="apf-preview" alt="preview" />
                <div *ngIf="!preview" class="apf-noimg muted">No image</div>
              </div>

              <div class="apf-side-actions">
                <button class="btn" type="button" (click)="removePhoto()" [disabled]="!preview || saving">Remove</button>
                <div class="apf-tip small muted">Square images work best (e.g. 800×800)</div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .apf-shell { max-width:1100px; margin:18px auto; padding:8px; }
    .apf-card { background:white;border-radius:10px;padding:18px;border:1px solid #eee; box-shadow: 0 6px 18px rgba(15,23,42,0.04); }
    .apf-title { margin:0 0 4px; font-size:20px; }
    .apf-sub { margin:0 0 12px; color:#6b7280; font-size:13px; }

    .apf-grid { display:grid; grid-template-columns: 1fr 320px; gap:18px; align-items:start; }
    @media(max-width:920px){ .apf-grid { grid-template-columns: 1fr; } }

    .apf-field { margin-bottom:12px; }
    label { display:block; font-weight:700; margin-bottom:6px; }
    .apf-input { width:100%; padding:10px;border-radius:8px;border:1px solid #e6e6e6; font-size:14px; box-sizing:border-box; }
    textarea.apf-input { min-height:110px; resize:vertical; }

    .apf-row { display:flex; gap:12px; align-items:center; }

    .apf-actions { display:flex; gap:8px; align-items:center; margin-top:6px; }
    .btn { padding:8px 12px; border-radius:8px; border:none; cursor:pointer; font-weight:700; }
    .btn.primary { background:#0ea5a4; color:white; }
    .btn.ghost { background:transparent; border:1px solid #e6e6e6; color:#374151; }
    .btn:disabled { opacity:0.6; cursor:not-allowed; }

    .apf-side { text-align:center; }
    .apf-preview-wrap { margin-top:8px; }
    .apf-preview { width:240px; height:240px; object-fit:cover; border-radius:8px; border:1px solid #eee; display:block; margin:0 auto; }
    .apf-noimg { padding:26px; border-radius:8px; background:#fafafa; border:1px dashed #eee; }

    .apf-help { font-size:13px; color:#6b7280; margin-top:6px; }
    .muted { color:#6b7280; }
    .small { font-size:13px; }
    .required { color:#b91c1c; margin-left:6px; font-weight:700; }

    .apf-error { color:#b91c1c; margin-top:6px; font-size:13px; }
    .apf-tip { margin-top:10px; color:#6b7280; }
  `]
})
export class AdminProductFormComponent implements OnInit {
  form!: FormGroup;
  photoFile?: File;
  preview: string | null = null;
  saving = false;
  isEdit = false;
  id?: string;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private svc: AdminProductService,
    private categorySvc: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.min(0)]],
      section: ['mens', Validators.required],
      categoryId: [''],
      description: ['']
    });
  }

  get nameCtrl(): AbstractControl | null { return this.form.get('name'); }
  get priceCtrl(): AbstractControl | null { return this.form.get('price'); }
  get sectionCtrl(): AbstractControl | null { return this.form.get('section'); }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? undefined;
    this.isEdit = !!this.id;

    this.loadCategories(this.form.value.section);
    this.form.get('section')!.valueChanges.subscribe((s: string) => {
      this.loadCategories(s);
      this.form.patchValue({ categoryId: '' });
    });

    if (this.isEdit && this.id) this.load(this.id);
  }

  private normalizeCategoryValue(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (val._id) return val._id;
    return '';
  }

  loadCategories(section?: string) {
    this.categorySvc.getCategories(section).subscribe({
      next: (cats: any) => {
        if (Array.isArray(cats)) this.categories = cats;
        else this.categories = cats?.categories ?? cats?.items ?? cats?.data ?? [];
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  load(id: string) {
    this.svc.get(id).subscribe({
      next: (res: any) => {
        const p = res.product ?? res;
        const catVal = this.normalizeCategoryValue(p.categoryId);
        this.form.patchValue({
          name: p.name ?? '',
          price: p.price ?? 0,
          stock: p.stock ?? 0,
          section: p.section ?? 'mens',
          categoryId: catVal ?? '',
          description: p.description ?? ''
        });

        if (p.photo) this.preview = this.getPhotoUrl(p.photo);
        else this.preview = null;

        this.loadCategories(p.section ?? this.form.value.section);
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed to load product')
    });
  }

  onFile(ev: any) {
    const f: File | undefined = ev.target.files?.[0];
    if (!f) return;
    this.photoFile = f;

    try {
      const reader = new FileReader();
      reader.onload = () => this.preview = reader.result as string;
      reader.readAsDataURL(f);
    } catch (e) {
      this.preview = null;
    }
  }

  removePhoto() {
    this.photoFile = undefined;
    this.preview = null;
  }

  private getPhotoUrl(photo: string) {
    if (!photo) return '';
    if (photo.startsWith('http') || photo.startsWith('//')) return photo;
    const origin = window.location.origin;
    return photo.startsWith('/') ? `${origin}${photo}` : `${origin}/${photo}`;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fill required fields');
      return;
    }
    if (this.saving) return;
    this.saving = true;

    const v = this.form.value as { name: string; price: number; stock: number; section: string; categoryId?: string; description?: string };

    const fd = new FormData();
    fd.append('name', String(v.name));
    fd.append('price', String(v.price));
    fd.append('stock', String(v.stock));
    fd.append('section', String(v.section));
    if (v.categoryId) fd.append('categoryId', String(v.categoryId));
    if (v.description) fd.append('description', String(v.description));
    if (this.photoFile) fd.append('photo', this.photoFile, this.photoFile.name);

    const obs = this.isEdit && this.id ? this.svc.update(this.id, fd) : this.svc.create(fd);
    obs.subscribe({
      next: (res: any) => {
        this.saving = false;
        this.toast.success(this.isEdit ? 'Product updated' : 'Product created');
        this.router.navigate(['/admin/products']);
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.message || err?.message || 'Save failed';
        this.toast.error(msg);
      }
    });
  }

  cancel() {
    if (this.saving) return;
    this.router.navigate(['/admin/products']);
  }
}
