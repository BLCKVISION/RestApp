import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  username = '';
  password = '';
  error = false;

  // Carousel State
  carouselIndex = 0;
  carouselItems = [
    {
      title: 'Plataforma Centralizada',
      description: 'Gestiona tu inventario, entradas y salidas desde un solo lugar.'
    },
    {
      title: 'Monitoreo en Tiempo Real',
      description: 'Supervisa el movimiento de tus almacenes con analíticas precisas.'
    },
    {
      title: 'Escalabilidad Garantizada',
      description: 'Diseñado para crecer junto a tu red de centros de acopio.'
    }
  ];
  private carouselTimer: any;

  constructor(private auth: AuthService) {}

  ngAfterViewInit() {
    // GSAP clean entrance animation
    gsap.from('.login-card', {
      opacity: 0,
      x: -40,
      duration: 0.7,
      ease: 'power3.out'
    });

    gsap.from('.login-title, .login-subtitle', {
      opacity: 0,
      y: 12,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.2
    });

    gsap.from('.form-group', {
      opacity: 0,
      y: 10,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
      delay: 0.3
    });

    gsap.from('.login-btn', {
      opacity: 0,
      y: 10,
      duration: 0.5,
      ease: 'power2.out',
      delay: 0.5
    });

    // Start Carousel
    this.startCarousel();
  }

  ngOnDestroy() {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
    }
  }

  startCarousel() {
    this.carouselTimer = setInterval(() => {
      this.carouselIndex = (this.carouselIndex + 1) % this.carouselItems.length;
    }, 6000);
  }

  setCarouselIndex(index: number) {
    this.carouselIndex = index;
    clearInterval(this.carouselTimer);
    this.startCarousel();
  }

  submitting = false;

  onSubmit() {
    this.error = false;
    this.submitting = true;
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.submitting = false;
      },
      error: () => {
        this.submitting = false;
        this.error = true;

        // Shake animation on error
        gsap.fromTo('.login-card',
          { x: -10 },
          { x: 0, duration: 0.5, ease: 'rough({template: none, strength: 1, points: 20, taper: none, randomize: true, clamp: false})', clearProps: 'x' }
        );
      }
    });
  }
}
