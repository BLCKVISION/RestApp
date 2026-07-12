import { Component, OnInit, AfterViewInit, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { ToastService } from './core/services/toast.service';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from './core/services/notification.service';
import gsap from 'gsap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  menuOpen = true;
  showGlobalLoader = true;
  isUserMenuOpen = false;
  isNotificationsOpen = false;

  get isPublicRoute(): boolean {
    return this.router.url.includes('/solicitar');
  }

  constructor(
    public auth: AuthService,
    private cdr: ChangeDetectorRef,
    public notificationService: NotificationService,
    private toast: ToastService,
    public router: Router
  ) {}

  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value.trim();
    if (val.length === 3) { // just to show it once when they start typing
      this.toast.success(`Buscando coincidencias para "${val}"... (En desarrollo)`);
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isNotificationsOpen = false;
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    this.isUserMenuOpen = false;
    if (this.isNotificationsOpen) {
      this.notificationService.markAllAsRead();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.topbar__icon-btn') && !target.closest('.notifications-dropdown')) {
      this.isNotificationsOpen = false;
    }
    if (!target.closest('.topbar__profile') && !target.closest('.user-dropdown')) {
      this.isUserMenuOpen = false;
    }
  }

  ngAfterViewInit() {
    // Start logo reveal animation
    gsap.fromTo('.loader-logo-reveal', 
      { clipPath: 'polygon(0 0, 0% 0, 0% 100%, 0 100%)', opacity: 0.5 },
      {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        opacity: 1,
        duration: 1.5,
        ease: 'power2.inOut',
        delay: 0.2,
        onComplete: () => {
          // Slide UP the loader screen
          gsap.to('.loader-overlay', {
            yPercent: -100,
            duration: 0.8,
            ease: 'power3.inOut',
            onComplete: () => {
              this.showGlobalLoader = false;
              this.cdr.detectChanges();
            }
          });
        }
      }
    );
  }

  navItems = [
    { path: '/dashboard', label: 'Inicio', icon: 'home' },
    { path: '/solicitudes', label: 'Pedidos', icon: 'pedidos' },
    { path: '/salida', label: 'Entregas', icon: 'entregas' },
    { path: '/movimientos', label: 'Analítica', icon: 'historial' },
    { path: '/reportes', label: 'Informes', icon: 'reportes' },
  ];
}
