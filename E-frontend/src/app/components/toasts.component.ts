import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    <div class="toasts-wrap" aria-live="polite">
      <div *ngFor="let t of (toastSvc.toasts | async)" class="toast" [ngClass]="t.type">
        <div class="toast-msg">{{ t.message }}</div>
        <button class="toast-close" (click)="toastSvc.dismiss(t.id)">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .toasts-wrap {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
      display:flex;
      flex-direction:column;
      gap:8px;
      max-width:320px;
    }
    .toast {
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:10px 12px;
      border-radius:8px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.08);
      font-size:14px;
      color:#fff;
    }
    .toast .toast-close { background:transparent;border:0;color:inherit;font-size:14px;cursor:pointer;margin-left:8px }
    .toast.info { background:#2f86eb; }
    .toast.success { background:#16a34a; }
    .toast.error { background:#dc2626; }
  `]
})
export class ToastsComponent {
  constructor(public toastSvc: ToastService) {}
}
