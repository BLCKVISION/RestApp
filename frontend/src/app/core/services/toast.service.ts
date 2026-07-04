import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  dismiss(id: number) {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  private show(message: string, type: Toast['type']) {
    const id = this.nextId++;
    this.toasts.update((toasts) => [...toasts, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 3500);
  }
}
