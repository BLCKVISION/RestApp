import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ResumenInventario } from '../../core/models/models';
import gsap from 'gsap';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent implements OnInit, AfterViewInit {
  resumen: ResumenInventario | null = null;
  loading = true;
  today = new Date();
  totalEntradasHoy = 0;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.api.getResumen().subscribe({
      next: (data) => {
        this.resumen = data;
        this.totalEntradasHoy = data.inventarioPorTipo?.reduce((sum, item) => sum + (item.entradasHoy || 0), 0) || 0;
        this.loading = false;
        this.cdr.detectChanges(); // Ensure DOM has rendered the report structure before running GSAP
        
        // Trigger report animations
        this.animateReportPage();
      },
      error: () => this.loading = false
    });
  }

  ngAfterViewInit() {
    this.applySplitText('.rpt__title');

    setTimeout(() => {
      gsap.fromTo('.rpt__title .split-char', 
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.0, stagger: 0.08, ease: 'power4.out' }
      );

      gsap.fromTo('.rpt__subtitle', 
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }, 100);
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

  animateReportPage() {
    // Staggered reveal for all KPI cards
    gsap.fromTo('.kpi-card', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.0, stagger: 0.18, ease: 'power3.out', clearProps: 'transform' }
    );

    // Fade-in slides for the report document and layout columns
    gsap.fromTo('.rpt-card, .forecast-card, .rpt-quick', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.0, stagger: 0.15, ease: 'power3.out', clearProps: 'transform', delay: 0.2 }
    );

    // Stagger table rows
    gsap.fromTo('.rpt-table tbody tr', 
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out', delay: 0.4 }
    );
  }

  printReport() {
    window.print();
  }
}
