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
  // Static cache variables to prevent flicker when navigating back to the Dashboard
  private static cachedResumen: ResumenInventario | null = null;
  private static cachedDatosGrafico: DatosGrafico[] = [];
  private static hasLoaded = false;

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
    if (DashboardComponent.hasLoaded) {
      // If already loaded and DOM is present, run stagger animation immediately on entry
      setTimeout(() => {
        this.animateDashboard();
      }, 50);
    }
  }

  loadData() {
    // If we have cached data, assign it immediately and set loading to false to prevent spinner blink
    if (DashboardComponent.hasLoaded) {
      this.resumen = DashboardComponent.cachedResumen;
      this.datosGrafico = DashboardComponent.cachedDatosGrafico;
      this.loading = false;
    } else {
      this.loading = true;
    }

    this.api.getResumen().subscribe({
      next: (data) => {
        const isFirstLoad = !DashboardComponent.hasLoaded;
        this.resumen = data;
        DashboardComponent.cachedResumen = data;
        DashboardComponent.hasLoaded = true;
        this.loading = false;
        
        // Trigger stagger animations only on the very first render (ngAfterViewInit handles subsequent re-entries)
        if (isFirstLoad) {
          setTimeout(() => {
            this.animateDashboard();
          }, 50);
        }
      },
      error: () => (this.loading = false),
    });

    this.cargarGrafico();
  }

  cargarGrafico() {
    this.api.getDatosGrafico(this.selectedRango).subscribe({
      next: (data) => {
        this.datosGrafico = data;
        DashboardComponent.cachedDatosGrafico = data;
        // Re-trigger animation when data changes
        setTimeout(() => {
          gsap.fromTo('.bar-chart__expense-pill, .bar-chart__income-pill', 
            { opacity: 0, scaleY: 0, transformOrigin: 'bottom' },
            { opacity: 1, scaleY: 1, duration: 0.6, stagger: 0.08, clearProps: 'transform,opacity' }
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
    // Apply premium SplitText effect to the greeting title
    this.applySplitText('.dash__title');

    // Animating split characters (slow and smooth stagger)
    gsap.fromTo('.dash__title .split-char',
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.0, stagger: 0.08, ease: 'power4.out' }
    );

    // Staggered card reveal animation - slowed down to be highly visible
    gsap.fromTo('.card', 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1.0, stagger: 0.18, ease: 'power3.out', clearProps: 'transform' }
    );

    gsap.fromTo('.kpi-card__value, .chart-card__big-value, .availability-card__big-value', 
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
    );
  }

  private applySplitText(selector: string) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el: any) => {
      if (el.querySelector('.split-word')) return;
      const text = el.textContent || '';
      el.innerHTML = text
        .split(' ')
        .map((word: string) => `<span class="split-word" style="display: inline-block; overflow: hidden; vertical-align: bottom;"><span class="split-char" style="display: inline-block;">${word}</span></span>`)
        .join(' ');
    });
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
