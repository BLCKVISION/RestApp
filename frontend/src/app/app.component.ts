import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import gsap from 'gsap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  menuOpen = true;
  showGlobalLoader = true;
  isUserMenuOpen = false;

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }


  constructor(public auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    // Start loader bar animation globally
    gsap.to('.loader-overlay__bar-fill', {
      scaleX: 1,
      duration: 1.2,
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
    });
  }

  navItems = [
    { path: '/dashboard', label: 'Inicio', icon: 'home' },
    { path: '/solicitudes', label: 'Pedidos', icon: 'pedidos' },
    { path: '/salida', label: 'Entregas', icon: 'entregas' },
    { path: '/movimientos', label: 'Analítica', icon: 'historial' },
    { path: '/reportes', label: 'Informes', icon: 'reportes' },
  ];
}
