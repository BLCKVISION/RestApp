import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { PermisoDirective } from '../../core/directives/permiso.directive';
import { Ingrediente, Receta, TipoComida, NivelMenu } from '../../core/models/models';

declare const gsap: any;

interface RecetaLinea {
  ingredienteId: string;
  cantidadPorRacion: number | null;
  personalizable: boolean;
  alternativas: string[];
}

@Component({
  selector: 'app-catalogo-menus',
  standalone: true,
  imports: [CommonModule, FormsModule, PermisoDirective],
  templateUrl: './catalogo-menus.component.html',
  styleUrl: './catalogo-menus.component.scss'
})
export class CatalogoMenusComponent implements OnInit, AfterViewInit {
  activeTab: 'ingredientes' | 'recetas' = 'ingredientes';

  ingredientes: Ingrediente[] = [];
  recetas: Receta[] = [];
  tiposComida: TipoComida[] = [];
  niveles = [NivelMenu.VIP, NivelMenu.PREMIUM, NivelMenu.PLATINO];

  loading = true;

  // ─── Ingrediente modal ───
  isIngredienteModalOpen = false;
  savingIngrediente = false;
  ingredienteEnEdicion: Ingrediente | null = null;
  ingredienteForm = {
    nombre: '',
    unidad: '',
    descripcion: ''
  };

  // ─── Receta modal ───
  isRecetaModalOpen = false;
  savingReceta = false;
  recetaEnEdicion: Receta | null = null;
  recetaForm = {
    nombre: '',
    tipoComidaId: '',
    nivel: NivelMenu.VIP as NivelMenu
  };
  recetaLineas: RecetaLinea[] = [];

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.api.getTiposComida().subscribe({ next: data => this.tiposComida = data });
    this.loadAll();
  }

  ngAfterViewInit() {
    gsap.fromTo('.page__title, .page__subtitle',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
    gsap.fromTo('.config-tab',
      { opacity: 0, x: -15 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
    );
  }

  loadAll() {
    this.loading = true;
    this.api.getIngredientes().subscribe({
      next: data => { this.ingredientes = data; this.cdr.detectChanges(); }
    });
    this.api.getRecetas().subscribe({
      next: data => { this.recetas = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; }
    });
  }

  // ─── Helpers ───
  getTipoComidaNombre(id: string): string {
    return this.tiposComida.find(t => t.id === id)?.nombre || id;
  }

  getIngredienteNombre(id: string): string {
    return this.ingredientes.find(i => i.id === id)?.nombre || id;
  }

  // ═══ Ingredientes CRUD ═══
  abrirCrearIngrediente() {
    this.ingredienteEnEdicion = null;
    this.ingredienteForm = { nombre: '', unidad: '', descripcion: '' };
    this.isIngredienteModalOpen = true;
  }

  abrirEditarIngrediente(ing: Ingrediente) {
    this.ingredienteEnEdicion = ing;
    this.ingredienteForm = {
      nombre: ing.nombre,
      unidad: ing.unidad,
      descripcion: ing.descripcion || ''
    };
    this.isIngredienteModalOpen = true;
  }

  cerrarIngredienteModal() {
    this.isIngredienteModalOpen = false;
    this.ingredienteEnEdicion = null;
    this.cdr.detectChanges();
  }

  async guardarIngrediente() {
    if (!this.ingredienteForm.nombre || !this.ingredienteForm.unidad) {
      this.toast.error('Nombre y unidad son obligatorios');
      return;
    }

    this.savingIngrediente = true;
    const payload = {
      nombre: this.ingredienteForm.nombre,
      unidad: this.ingredienteForm.unidad,
      descripcion: this.ingredienteForm.descripcion
    };

    const obs = this.ingredienteEnEdicion
      ? this.api.actualizarIngrediente(this.ingredienteEnEdicion.id, payload)
      : this.api.crearIngrediente(payload);

    obs.subscribe({
      next: () => {
        this.savingIngrediente = false;
        this.toast.success(this.ingredienteEnEdicion ? '✓ Ingrediente actualizado' : '✓ Ingrediente creado');
        this.cerrarIngredienteModal();
        this.loadAll();
      },
      error: () => {
        this.savingIngrediente = false;
        this.toast.error('Ocurrió un error al guardar el ingrediente');
      }
    });
  }

  // ═══ Recetas CRUD ═══
  abrirCrearReceta() {
    this.recetaEnEdicion = null;
    this.recetaForm = { nombre: '', tipoComidaId: '', nivel: NivelMenu.VIP };
    this.recetaLineas = [this.nuevaLinea()];
    this.isRecetaModalOpen = true;
  }

  abrirEditarReceta(receta: Receta) {
    this.recetaEnEdicion = receta;
    this.recetaForm = {
      nombre: receta.nombre,
      tipoComidaId: receta.tipoComidaId,
      nivel: receta.nivel
    };
    this.recetaLineas = receta.ingredientes.map(i => ({
      ingredienteId: i.ingredienteId,
      cantidadPorRacion: i.cantidadPorRacion,
      personalizable: !!i.personalizable,
      alternativas: [...(i.alternativas || [])]
    }));
    if (this.recetaLineas.length === 0) this.recetaLineas = [this.nuevaLinea()];
    this.isRecetaModalOpen = true;
  }

  private nuevaLinea(): RecetaLinea {
    return { ingredienteId: '', cantidadPorRacion: null, personalizable: false, alternativas: [] };
  }

  agregarLinea() {
    this.recetaLineas.push(this.nuevaLinea());
  }

  quitarLinea(index: number) {
    this.recetaLineas.splice(index, 1);
    if (this.recetaLineas.length === 0) this.recetaLineas = [this.nuevaLinea()];
  }

  /** Ingredientes que pueden ser alternativa (todos salvo el propio de la línea). */
  alternativasDisponibles(linea: RecetaLinea): Ingrediente[] {
    return this.ingredientes.filter(i => i.id !== linea.ingredienteId);
  }

  toggleAlternativa(linea: RecetaLinea, ingredienteId: string) {
    const idx = linea.alternativas.indexOf(ingredienteId);
    if (idx === -1) {
      linea.alternativas.push(ingredienteId);
    } else {
      linea.alternativas.splice(idx, 1);
    }
  }

  cerrarRecetaModal() {
    this.isRecetaModalOpen = false;
    this.recetaEnEdicion = null;
    this.cdr.detectChanges();
  }

  async guardarReceta() {
    const lineasValidas = this.recetaLineas.filter(l => l.ingredienteId && l.cantidadPorRacion && l.cantidadPorRacion > 0);

    if (!this.recetaForm.nombre || !this.recetaForm.tipoComidaId || lineasValidas.length === 0) {
      this.toast.error('Completa nombre, momento y al menos un ingrediente con cantidad válida');
      return;
    }

    this.savingReceta = true;
    const payload = {
      nombre: this.recetaForm.nombre,
      tipoComidaId: this.recetaForm.tipoComidaId,
      nivel: this.recetaForm.nivel,
      personalizable: lineasValidas.some(l => l.personalizable),
      ingredientes: lineasValidas.map(l => ({
        ingredienteId: l.ingredienteId,
        cantidadPorRacion: l.cantidadPorRacion,
        personalizable: l.personalizable,
        alternativas: l.personalizable ? l.alternativas : []
      }))
    };

    const obs = this.recetaEnEdicion
      ? this.api.actualizarReceta(this.recetaEnEdicion.id, payload)
      : this.api.crearReceta(payload);

    obs.subscribe({
      next: () => {
        this.savingReceta = false;
        this.toast.success(this.recetaEnEdicion ? '✓ Receta actualizada' : '✓ Receta creada');
        this.cerrarRecetaModal();
        this.loadAll();
      },
      error: () => {
        this.savingReceta = false;
        this.toast.error('Ocurrió un error al guardar la receta');
      }
    });
  }
}
