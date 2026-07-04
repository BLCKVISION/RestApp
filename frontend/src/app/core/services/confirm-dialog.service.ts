import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogRequest {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

interface ConfirmDialogState extends ConfirmDialogRequest {
  resolve: (confirmed: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly state = signal<ConfirmDialogState | null>(null);

  confirm(request: ConfirmDialogRequest): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({ ...request, resolve });
    });
  }

  respond(confirmed: boolean) {
    this.state()?.resolve(confirmed);
    this.state.set(null);
  }
}
