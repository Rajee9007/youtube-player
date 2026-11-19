import { Injectable, signal } from '@angular/core';

export interface SylToast {
  id: string;
  message: string;
  title?: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SylToastService {
  readonly toasts = signal<SylToast[]>([]);

  show(toast: Omit<SylToast, 'id'>): string {
    const id = Math.random().toString(36).substring(2, 9);
    const item: SylToast = {
      id,
      duration: 4000,
      variant: 'info',
      ...toast,
    };

    this.toasts.update((list) => [...list, item]);

    if (item.duration && item.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, item.duration);
    }

    return id;
  }

  success(message: string, title?: string): string {
    return this.show({ message, title, variant: 'success' });
  }

  error(message: string, title?: string): string {
    return this.show({ message, title, variant: 'danger' });
  }

  warning(message: string, title?: string): string {
    return this.show({ message, title, variant: 'warning' });
  }

  info(message: string, title?: string): string {
    return this.show({ message, title, variant: 'info' });
  }

  dismiss(id: string): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
