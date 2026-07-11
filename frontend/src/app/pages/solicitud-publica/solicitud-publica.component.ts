import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { CentroAcopio, TipoComida } from '../../core/models/models';
import gsap from 'gsap';

@Component({
  selector: 'app-solicitud-publica',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './solicitud-publica.component.html',
  styleUrl: './solicitud-publica.component.scss'
})
export class SolicitudPublicaComponent implements OnInit, AfterViewInit {
  centros: CentroAcopio[] = [];
  tiposComida: TipoComida[] = [];
  submitting = false;
  success = false;
  error = false;
  showSummary = false;

  form = {
    centroId: '',
    tipoComidaId: '',
    cantidad: null as number | null,
    nota: '',
    solicitante: '',
    organizacion: '',
    horaEntrega: '',
    ubicacion: ''
  };

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.api.getCentros().subscribe({ next: data => this.centros = data });
    this.api.getTiposComida().subscribe({ next: data => this.tiposComida = data });
  }

  ngAfterViewInit() {
    this.applySplitText('.public-title');
    
    setTimeout(() => {
      gsap.fromTo('.public-title .split-char', 
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.0, stagger: 0.08, ease: 'power4.out' }
      );

      gsap.fromTo('.public-subtitle', 
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      gsap.fromTo('.public-card', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', clearProps: 'transform' }
      );
    }, 100);
  }

  private applySplitText(selector: string) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el: any) => {
      if (el.querySelector('.split-word')) return;
      const text = el.textContent || '';
      el.innerHTML = text
        .split(/(\s+)/)
        .map((word: string) => {
          if (word.trim() === '') return word;
          const chars = word.split('').map(char => `<span class="split-char" style="display:inline-block;">${char}</span>`).join('');
          return `<span class="split-word" style="display:inline-block; overflow:hidden;">${chars}</span>`;
        })
        .join('');
    });
  }

  get isValid(): boolean {
    return !!this.form.centroId && !!this.form.ubicacion && !!this.form.tipoComidaId && !!this.form.cantidad && this.form.cantidad > 0 && !!this.form.solicitante;
  }

  verResumen() {
    if (!this.isValid) return;
    this.showSummary = true;
    this.cdr.detectChanges();
    this.animateSummary();
  }

  cancelarResumen() {
    this.showSummary = false;
    this.cdr.detectChanges();
    this.animateForm();
  }

  private animateSummary() {
    this.applySplitText('.public-title');
    gsap.fromTo('.public-title .split-char', 
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.0, stagger: 0.08, ease: 'power4.out' }
    );
    gsap.fromTo('.summary-card', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', clearProps: 'transform' }
    );
  }

  private animateForm() {
    this.applySplitText('.public-title');
    gsap.fromTo('.public-title .split-char', 
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.0, stagger: 0.08, ease: 'power4.out' }
    );
    gsap.fromTo('.form-grid', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', clearProps: 'transform' }
    );
  }

  get selectedTipoComidaNombre(): string {
    const tipo = this.tiposComida.find(t => t.id === this.form.tipoComidaId);
    return tipo ? tipo.nombre : '---';
  }

  async confirmarRegistro() {
    if (!this.isValid || this.submitting) return;

    const confirmado = await this.confirmDialog.confirm({
      title: 'Confirmar solicitud',
      message: '¿Deseas enviar esta solicitud?',
      confirmText: 'Sí, enviar',
      cancelText: 'No',
    });
    if (!confirmado) return;

    this.submitting = true;
    this.error = false;

    this.api.crearSolicitud({
      centroId: this.form.centroId,
      tipoComidaId: this.form.tipoComidaId,
      cantidad: this.form.cantidad,
      solicitante: this.form.solicitante + (this.form.organizacion ? ` (${this.form.organizacion})` : ''),
      nota: this.form.nota,
      horaEntrega: this.form.horaEntrega || 'A convenir',
      ubicacion: this.form.ubicacion
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.showSummary = false;
        this.success = true;
        this.toast.success('✓ Solicitud enviada exitosamente');
      },
      error: () => {
        this.submitting = false;
        this.error = true;
        this.toast.error('Ocurrió un error al enviar tu solicitud. Intenta de nuevo.');
      }
    });
  }

  reset() {
    this.success = false;
    this.showSummary = false;
    this.form = {
      centroId: '',
      tipoComidaId: '',
      cantidad: null,
      nota: '',
      solicitante: '',
      organizacion: '',
      horaEntrega: '',
      ubicacion: ''
    };
  }
}
