import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialService } from '../../services/testimonial.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2 class="title">What our customers say</h2>

      <form class="form-card" (ngSubmit)="send()">
        <textarea [(ngModel)]="text" name="text" rows="3"
          placeholder="Share your experience"></textarea>
        <button type="submit" [disabled]="loading || !text.trim()">
          {{ loading ? 'Sending...' : 'Send' }}
        </button>
      </form>

      <div *ngIf="loadingList" class="loading">Loading testimonials...</div>

      <div *ngIf="!loadingList && list.length === 0" class="empty">
        No testimonials yet.
      </div>

      <div *ngIf="!loadingList && list.length > 0" class="list">
        <div *ngFor="let t of list" class="testimonial-card">
          <p class="text">“{{ t.text }}”</p>
          <div class="date">— {{ t.createdAt | date:'medium' }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 700px;
      margin: 20px auto;
      padding: 0 16px;
    }
    .title {
      text-align: center;
      margin-bottom: 20px;
      font-size: 22px;
      font-weight: 600;
    }
    .form-card {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #fff;
      padding: 16px;
      border: 1px solid #eee;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    textarea {
      resize: none;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #ccc;
      font-size: 14px;
      font-family: inherit;
    }
    button {
      align-self: flex-end;
      padding: 8px 16px;
      background: #2f86eb;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover:not([disabled]) {
      background: #236ac2;
    }
    button[disabled] {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .testimonial-card {
      background: #fff;
      padding: 14px;
      border-radius: 8px;
      border: 1px solid #eee;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .text {
      margin: 0 0 6px;
      font-size: 15px;
    }
    .date {
      font-size: 12px;
      color: #666;
      text-align: right;
    }
    .loading, .empty {
      text-align: center;
      color: #666;
      margin-top: 10px;
    }
  `]
})
export class TestimonialsComponent implements OnInit {
  text = '';
  loading = false;
  loadingList = false;
  list: any[] = [];

  constructor(private svc: TestimonialService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loadingList = true;
    this.svc.listPublic().subscribe({
      next: (res: any) => {
        this.list = res?.testimonials ?? res ?? [];
        this.loadingList = false;
      },
      error: () => {
        this.loadingList = false;
      }
    });
  }

  send() {
    if (!this.text.trim()) return;
    this.loading = true;
    this.svc.create(this.text.trim()).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Sent for approval');
        this.text = '';
        this.load();
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || 'Failed');
      }
    });
  }
}
