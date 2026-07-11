import { Injectable, signal, effect } from '@angular/core';

export interface NotificationItem {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  timestamp: Date;
  read: boolean;
  route?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private STORAGE_KEY = 'restapp_notifications';
  
  readonly notifications = signal<NotificationItem[]>([]);
  readonly unreadCount = signal<number>(0);

  constructor() {
    this.loadFromStorage();

    // Effect to update unread count whenever notifications change
    effect(() => {
      const current = this.notifications();
      const unread = current.filter(n => !n.read).length;
      this.unreadCount.set(unread);
      this.saveToStorage(current);
    });
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as any[];
        const items: NotificationItem[] = parsed.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        this.notifications.set(items);
      } else {
        // Default seed notifications
        this.notifications.set([
          {
            id: 'seed-1',
            message: 'Stock crítico: Sopa de Pollo (Quedan 12 raciones en Acopio Principal)',
            type: 'warning',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
            read: false
          },
          {
            id: 'seed-2',
            message: 'Nuevo pedido #P-4820 registrado por Comedor Central',
            type: 'info',
            timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
            read: false
          },
          {
            id: 'seed-3',
            message: 'El pedido #P-3912 ha sido marcado como LISTO para entrega',
            type: 'success',
            timestamp: new Date(Date.now() - 1000 * 60 * 300), // 5 hours ago
            read: true
          }
        ]);
      }
    } catch (e) {
      console.error('Error loading notifications', e);
    }
  }

  private saveToStorage(items: NotificationItem[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving notifications', e);
    }
  }

  addNotification(message: string, type: 'warning' | 'info' | 'success', route?: string) {
    const newItem: NotificationItem = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      message,
      type,
      timestamp: new Date(),
      read: false,
      route
    };
    this.notifications.update(prev => [newItem, ...prev]);
  }

  markAsRead(id: string) {
    this.notifications.update(prev => 
      prev.map(item => item.id === id ? { ...item, read: true } : item)
    );
  }

  markAllAsRead() {
    this.notifications.update(prev => 
      prev.map(item => ({ ...item, read: true }))
    );
  }

  removeNotification(id: string) {
    this.notifications.update(prev => prev.filter(item => item.id !== id));
  }

  clearAll() {
    this.notifications.set([]);
  }
}
