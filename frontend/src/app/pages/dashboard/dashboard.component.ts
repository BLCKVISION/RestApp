import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ResumenInventario, DatosGrafico, DistribucionCentro } from '../../core/models/models';
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
  datosGrafico: DatosGrafico[] = [];
  loading = true;
  showLoader = true;
  today = new Date();
  searchQuery = '';
  selectedRango = 'semanal';
  isOpenRango = false;
  showReportModal = false;

  constructor(
    private api: ApiService,
    public auth: AuthService
  ) {}

  @HostListener('document:click')
  onClickOutside() {
    this.isOpenRango = false;
  }

  closeReportModal() {
    this.showReportModal = false;
  }

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

    this.cargarGrafico();
  }

  cargarGrafico() {
    this.api.getDatosGrafico(this.selectedRango).subscribe({
      next: (data) => {
        this.datosGrafico = data;
        // Re-trigger animation when data changes
        setTimeout(() => {
          gsap.fromTo('.bar-chart__expense-pill, .bar-chart__income-pill', 
            { opacity: 0, scaleY: 0, transformOrigin: 'bottom' },
            { opacity: 1, scaleY: 1, duration: 0.5, stagger: 0.05, clearProps: 'transform,opacity' }
          );
        }, 50);
      },
    });
  }

  get rangoLabel(): string {
    switch(this.selectedRango) {
      case 'semanal': return 'Semanal';
      case 'mensual': return 'Mensual';
      case 'anual': return 'Anual';
      default: return 'Semanal';
    }
  }

  toggleRango(event: Event) {
    event.stopPropagation();
    this.isOpenRango = !this.isOpenRango;
  }

  selectRango(rango: string) {
    this.selectedRango = rango;
    this.isOpenRango = false;
    this.cargarGrafico();
  }

  animateDashboard() {
    // Staggered card reveal animation (0.6s duration)
    gsap.fromTo('.card', 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out', clearProps: 'transform' }
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
    if (!this.datosGrafico.length) return 1;
    return Math.max(...this.datosGrafico.map((d) => d.entradas + d.salidas), 1);
  }

  getSalidasHeight(dia: any): number {
    if (this.maxSemana === 0) return 0;
    return (dia.salidas / this.maxSemana) * 100;
  }

  getEntradasHeight(dia: any): number {
    if (this.maxSemana === 0) return 0;
    return (dia.entradas / this.maxSemana) * 100;
  }

  getDayLabel(label: string): string {
    return label;
  }

  getMovimientoTipoComida(tipoComidaId: string): string {
    if (!tipoComidaId) return 'General';
    if (!this.resumen) return '';
    const tipo = this.resumen.inventarioPorTipo.find((t) => t.tipoComidaId === tipoComidaId);
    return tipo ? tipo.tipoComida : 'General';
  }

  formatFecha(fecha: string): string {
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  }

  getInitials(name: string): string {
    if (!name) return 'OP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

}
