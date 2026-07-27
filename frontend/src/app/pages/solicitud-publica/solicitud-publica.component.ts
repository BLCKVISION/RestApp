import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { CentroAcopio, TipoComida, Receta, Ingrediente, NivelMenu, RecetaIngrediente } from '../../core/models/models';
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

  step: 'momento' | 'nivel' | 'menu' | 'form' | 'resumen' = 'momento';

  niveles = [NivelMenu.VIP, NivelMenu.PREMIUM, NivelMenu.PLATINO];
  recetas: Receta[] = [];
  ingredientes: Ingrediente[] = [];
  recetaSeleccionada: Receta | null = null;

  form = {
    centroId: '',
    tipoComidaId: '',
    cantidad: null as number | null,
    nota: '',
    solicitante: '',
    organizacion: '',
    horaEntrega: '',
    ubicacion: '',
    nivel: null as NivelMenu | null,
    recetaId: '',
    personalizacion: [] as { ingredienteOriginalId: string; ingredienteSustitutoId: string }[]
  };

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.api.getCentros().subscribe({ next: data => this.centros = data });
    this.api.getTiposComida().subscribe({ next: data => this.tiposComida = data.filter(t => t.disponibleEnPortal) });
    this.api.getIngredientes().subscribe({ next: data => this.ingredientes = data });
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

  /** Generalised step animation, reused for every wizard step. */
  private animateStep(contentSelector: string) {
    this.cdr.detectChanges();
    this.applySplitText('.public-title');
    gsap.fromTo('.public-title .split-char',
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.0, stagger: 0.08, ease: 'power4.out' }
    );
    gsap.fromTo(contentSelector,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', clearProps: 'transform' }
    );
  }

  // ─── Wizard navigation ──────────────────────────────────────────
  elegirMomento(tipo: TipoComida) {
    this.form.tipoComidaId = tipo.id;
    this.step = 'nivel';
    this.animateStep('.step-options');
  }

  elegirNivel(nivel: NivelMenu) {
    this.form.nivel = nivel;
    this.recetaSeleccionada = null;
    this.form.recetaId = '';
    this.form.personalizacion = [];
    this.recetas = [];
    this.step = 'menu';
    this.api.getRecetas({ tipoComidaId: this.form.tipoComidaId, nivel }).subscribe({
      next: data => this.recetas = data
    });
    this.animateStep('.step-options');
  }

  elegirReceta(receta: Receta) {
    this.recetaSeleccionada = receta;
    this.form.recetaId = receta.id;
    // Initialise personalization with the original ingredient for each personalizable slot.
    this.form.personalizacion = receta.ingredientes
      .filter(i => i.personalizable)
      .map(i => ({ ingredienteOriginalId: i.ingredienteId, ingredienteSustitutoId: i.ingredienteId }));

    if (!receta.personalizable) {
      this.step = 'form';
      this.animateStep('.form-grid');
    }
  }

  /** Slots that can be customised on the selected receta. */
  get slotsPersonalizables(): RecetaIngrediente[] {
    if (!this.recetaSeleccionada) return [];
    return this.recetaSeleccionada.ingredientes.filter(i => i.personalizable);
  }

  onSustitutoChange(ingredienteOriginalId: string, ingredienteSustitutoId: string) {
    const entry = this.form.personalizacion.find(p => p.ingredienteOriginalId === ingredienteOriginalId);
    if (entry) {
      entry.ingredienteSustitutoId = ingredienteSustitutoId;
    } else {
      this.form.personalizacion.push({ ingredienteOriginalId, ingredienteSustitutoId });
    }
  }

  getSustitutoActual(ingredienteOriginalId: string): string {
    return this.form.personalizacion.find(p => p.ingredienteOriginalId === ingredienteOriginalId)?.ingredienteSustitutoId
      || ingredienteOriginalId;
  }

  continuarDesdeMenu() {
    if (!this.form.recetaId) return;
    this.step = 'form';
    this.animateStep('.form-grid');
  }

  volverAMenu() {
    this.step = 'menu';
    this.animateStep('.step-options');
  }

  cambiarMomento() {
    this.step = 'momento';
    this.animateStep('.step-options');
  }

  getIngredienteNombre(id: string): string {
    return this.ingredientes.find(i => i.id === id)?.nombre || id;
  }

  get nivelLabel(): string {
    return this.form.nivel ? this.form.nivel : '---';
  }

  get selectedTipoComidaNombre(): string {
    const tipo = this.tiposComida.find(t => t.id === this.form.tipoComidaId);
    return tipo ? tipo.nombre : '---';
  }

  get selectedRecetaNombre(): string {
    return this.recetaSeleccionada ? this.recetaSeleccionada.nombre : '---';
  }

  get isValid(): boolean {
    return !!this.form.centroId && !!this.form.ubicacion && !!this.form.tipoComidaId
      && !!this.form.nivel && !!this.form.recetaId
      && !!this.form.cantidad && this.form.cantidad > 0 && !!this.form.solicitante;
  }

  verResumen() {
    if (!this.isValid) return;
    this.step = 'resumen';
    this.animateStep('.summary-card');
  }

  cancelarResumen() {
    this.step = 'form';
    this.animateStep('.form-grid');
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
      ubicacion: this.form.ubicacion,
      nivel: this.form.nivel,
      recetaId: this.form.recetaId,
      personalizacion: this.form.personalizacion
    }).subscribe({
      next: () => {
        this.submitting = false;
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
    this.error = false;
    this.step = 'momento';
    this.recetaSeleccionada = null;
    this.recetas = [];
    this.form = {
      centroId: '',
      tipoComidaId: '',
      cantidad: null,
      nota: '',
      solicitante: '',
      organizacion: '',
      horaEntrega: '',
      ubicacion: '',
      nivel: null,
      recetaId: '',
      personalizacion: []
    };
  }
}
