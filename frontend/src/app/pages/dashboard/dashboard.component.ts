import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ResumenInventario, DatosSemana, DistribucionCentro } from '../../core/models/models';
import gsap from 'gsap';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  resumen: ResumenInventario | null = null;
  datosSemana: DatosSemana[] = [];
  distribucion: DistribucionCentro[] = [];
  loading = true;
  showLoader = true;
  today = new Date();
  searchQuery = '';

  constructor(
    private api: ApiService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    // Other post-view initializations can go here
  }

  loadData() {
    this.loading = true;

    this.api.getResumen().subscribe({
      next: (data) => {
        this.resumen = data;
        this.loading = false;
        
        // Trigger stagger animations once DOM renders the data
        setTimeout(() => {
          this.animateDashboard();
        }, 50);
      },
      error: () => (this.loading = false),
    });

    this.api.getMovimientosSemana().subscribe({
      next: (data) => (this.datosSemana = data),
    });

    this.api.getDistribucionPorCentro().subscribe({
      next: (data) => (this.distribucion = data),
    });
  }

  animateDashboard() {
    // Staggered card reveal animation (0.6s duration)
    gsap.fromTo('.card', 
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
    );

    // Split text line stagger simulation for headers
    gsap.fromTo('.dash__title', 
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );

    gsap.fromTo('.kpi-card__value, .chart-card__big-value, .availability-card__big-value', 
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.2 }
    );
  }

  // ─── Chart helpers ──────────────────────────────────────────────
  get availabilityPills(): string[] {
    if (!this.resumen) return [];
    const totalPills = 36;
    
    let color1Count = this.resumen.inventarioPorTipo[0]?.stockActual || 0;
    let color2Count = this.resumen.inventarioPorTipo[1]?.stockActual || 0;
    let color3Count = 0;
    for (let i = 2; i < this.resumen.inventarioPorTipo.length; i++) {
      color3Count += this.resumen.inventarioPorTipo[i].stockActual;
    }
    
    const total = color1Count + color2Count + color3Count || 1;
    const p1 = Math.round((color1Count / total) * totalPills);
    const p2 = Math.round((color2Count / total) * totalPills);
    const p3 = totalPills - p1 - p2;
    
    const pills: string[] = [];
    for(let i = 0; i < p1; i++) pills.push('orange');
    for(let i = 0; i < p2; i++) pills.push('yellow');
    for(let i = 0; i < p3; i++) pills.push('grey');
    
    return pills;
  }
  
  get maxSemana(): number {
    if (!this.datosSemana.length) return 1;
    // Maximum height based on total (Income + Expense)
    return Math.max(...this.datosSemana.map((d) => d.entradas + d.salidas), 1);
  }

  getBarBgHeight(dia: any): number {
    return ((dia.entradas + dia.salidas) / this.maxSemana) * 100;
  }

  getInnerBarHeight(dia: any): number {
    const total = dia.entradas + dia.salidas;
    if (total === 0) return 0;
    return (dia.entradas / total) * 100;
  }

  getDayLabel(fecha: string): string {
    const d = new Date(fecha);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months[d.getMonth()];
  }

  get maxDistribucion(): number {
    if (!this.distribucion.length) return 1;
    let max = 0;
    this.distribucion.forEach((c) =>
      c.porTipo.forEach((t) => {
        if (t.cantidad > max) max = t.cantidad;
      })
    );
    return max || 1;
  }

  getDistBarHeight(value: number): number {
    return (value / this.maxDistribucion) * 100;
  }

  getMovimientoTipoComida(tipoComidaId: string): string {
    if (!this.resumen) return '';
    const tipo = this.resumen.inventarioPorTipo.find((t) => t.tipoComidaId === tipoComidaId);
    return tipo ? tipo.tipoComida : '';
  }

  formatFecha(fecha: string): string {
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  }

  // Inventory health percentage
  get inventoryHealth(): number {
    if (!this.resumen) return 0;
    const total = this.resumen.totalInventario;
    return Math.min(Math.round((total / 2000) * 100), 100);
  }
}
