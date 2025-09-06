import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { ToastService } from '../../services/toast.service';
import { RouterModule } from '@angular/router';
import { SpinnerComponent } from '../../components/spinner.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SpinnerComponent],
  template: `
    <h2>Contact Us</h2>
    <form #f="ngForm" (ngSubmit)="submit(f)" class="contact-form">
      <label>Category</label>
      <select [(ngModel)]="model.category" name="category" required>
        <option value="question">Question</option>
        <option value="complain">Complain</option>
      </select>

      <label>Message</label>
      <textarea [(ngModel)]="model.message"
                name="message"
                rows="5"
                required
                placeholder="Your message"></textarea>

      <button type="submit" [disabled]="loading || f.invalid" [attr.aria-busy]="loading">
        <app-spinner *ngIf="loading" size="small"></app-spinner>
        <span *ngIf="!loading">Send</span>
      </button>
    </form>
  `,
  styles: [`
    .contact-form {
      max-width: 480px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    select, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }
    button {
      padding: 10px;
      border: none;
      border-radius: 6px;
      background: #2f86eb;
      color: #fff;
      cursor: pointer;
    }
    button[disabled] {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class ContactComponent {
  model = {
    category: 'question' as 'question' | 'complain',
    message: ''
  };
  loading = false;

  constructor(private svc: ContactService, private toast: ToastService) {}

  submit(form: NgForm) {
    if (!this.model.message.trim()) {
      return this.toast.error('Message required');
    }
    this.loading = true;

    this.svc.sendMessage(this.model).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Message sent');
        form.resetForm({ category: 'question', message: '' });
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || 'Failed to send');
      }
    });
  }
}
