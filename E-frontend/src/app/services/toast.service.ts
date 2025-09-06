import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Toast = { id: string; message: string; type?: 'success'|'error'|'info'; ttl?: number };

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  readonly toasts = this.toasts$.asObservable();

  show(message: string, type: Toast['type'] = 'info', ttl = 4000) {
    const id = Math.random().toString(36).slice(2, 9);
    const t: Toast = { id, message, type, ttl };
    this.toasts$.next([...this.toasts$.value, t]);
    if (ttl > 0) setTimeout(() => this.dismiss(id), ttl);
  }
  success(message: string, ttl = 4000) { this.show(message, 'success', ttl); }
  error(message: string, ttl = 6000) { this.show(message, 'error', ttl); }
  info(message: string, ttl = 3000) { this.show(message, 'info', ttl); }

  dismiss(id: string) {
    this.toasts$.next(this.toasts$.value.filter(t => t.id !== id));
  }
}
