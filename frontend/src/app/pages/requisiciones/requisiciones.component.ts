import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { PermisoDirective } from '../../core/directives/permiso.directive';
import { Requisicion, EstadoRequisicion, Ingrediente, Receta } from '../../core/models/models';

declare const gsap: any;

@Component({
  selector: 'app-requisiciones',
  standalone: true,
  imports: [CommonModule, PermisoDirective],
  templateUrl: './requisiciones.component.html',
  styleUrl: './requisiciones.component.scss'
})
export class RequisicionesComponent implements OnInit, AfterViewInit {
  requisiciones: Requisicion[] = [];
  ingredientes: Ingrediente[] = [];
  recetas: Receta[] = [];
  loading = true;

  pendientes: Requisicion[] = [];
  resueltas: Requisicion[] = [];

  resolvingId: string | null = null;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,
    private notificationService: NotificationService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.api.getIngredientes().subscribe({ next: data => this.ingredientes = data });
    this.api.getRecetas().subscribe({ next: data => this.recetas = data });
    this.load();
  }

  ngAfterViewInit() {
    this.applySplitText('.page__title');
    setTimeout(() => {
      gsap.fromTo('.page__title .split-char',
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.0, stagger: 0.08, ease: 'power4.out' }
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

  load() {
    this.loading = true;
    this.api.getRequisiciones().subscribe({
      next: (data) => {
        this.requisiciones = data;
        this.split();
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          gsap.fromTo('.req-card',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', clearProps: 'transform' }
          );
        }, 100);
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar las requisiciones');
      }
    });
  }

  private split() {
    this.pendientes = this.requisiciones.filter(r => r.estado === EstadoRequisicion.PENDIENTE);
    this.resueltas = this.requisiciones.filter(r => r.estado !== EstadoRequisicion.PENDIENTE);
  }

  getRecetaNombre(id: string): string {
    return this.recetas.find(r => r.id === id)?.nombre || id;
  }

  getIngredienteNombre(id: string): string {
    return this.ingredientes.find(i => i.id === id)?.nombre || id;
  }

  getIngredienteUnidad(id: string): string {
    return this.ingredientes.find(i => i.id === id)?.unidad || '';
  }

  folio(solicitudId: string): string {
    return (solicitudId || '').slice(-6).toUpperCase();
  }

  async resolver(req: Requisicion, estado: EstadoRequisicion) {
    if (this.resolvingId === req.id) return;

    const esAceptar = estado === EstadoRequisicion.ACEPTADA;
    const confirmado = await this.confirmDialog.confirm({
      title: esAceptar ? 'Aceptar requisición' : 'Rechazar requisición',
      message: esAceptar
        ? '¿Deseas aceptar esta requisición y liberar el inventario correspondiente?'
        : '¿Deseas rechazar esta requisición?',
      confirmText: esAceptar ? 'Sí, aceptar' : 'Sí, rechazar',
      cancelText: 'Cancelar',
      variant: esAceptar ? 'default' : 'danger',
    });
    if (!confirmado) return;

    const resueltoPor = this.auth.currentUser()?.nombre || 'Sistema';

    this.resolvingId = req.id;
    this.api.resolverRequisicion(req.id, { estado, resueltoPor }).subscribe({
      next: (updated) => {
        const index = this.requisiciones.findIndex(r => r.id === updated.id);
        if (index !== -1) this.requisiciones[index] = updated;
        this.split();
        this.resolvingId = null;
        this.cdr.detectChanges();

        const recetaNombre = this.getRecetaNombre(updated.recetaId);
        this.toast.success(esAceptar ? '✓ Requisición aceptada' : '✓ Requisición rechazada');
        this.notificationService.addNotification(
          `Requisición #${this.folio(updated.solicitudId)} (${recetaNombre}) ${esAceptar ? 'ACEPTADA' : 'RECHAZADA'} por ${resueltoPor}.`,
          esAceptar ? 'success' : 'warning',
          '/requisiciones'
        );
      },
      error: () => {
        this.resolvingId = null;
        this.toast.error('Error al resolver la requisición');
      }
    });
  }

  aceptar(req: Requisicion) {
    this.resolver(req, EstadoRequisicion.ACEPTADA);
  }

  rechazar(req: Requisicion) {
    this.resolver(req, EstadoRequisicion.RECHAZADA);
  }
}
