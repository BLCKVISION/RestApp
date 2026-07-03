import { Component, OnInit, AfterViewInit } from '@angular/core';
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

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getResumen().subscribe({
      next: (data) => {
        this.resumen = data;
        this.loading = false;
        
        // Stagger list elements on data load
        setTimeout(() => {
          this.animateReport();
        }, 50);
      },
      error: () => this.loading = false
    });
  }

  ngAfterViewInit() {
    gsap.fromTo('.page__title, .page__subtitle', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
  }

  animateReport() {
    gsap.fromTo('.report-document', 
      { opacity: 0, scale: 0.98, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );

    gsap.fromTo('.summary-box', 
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
    );

    gsap.fromTo('.report-table tbody tr', 
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.3 }
    );
  }

  printReport() {
    window.print();
  }
}
