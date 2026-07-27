import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { Rol, PermisoCatalogo } from '../../core/models/models';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {
  roles: Rol[] = [];
  catalogoPermisos: PermisoCatalogo[] = [];
  loading = true;

  // ─── Rol modal ───
  isRolModalOpen = false;
  savingRol = false;
  rolEnEdicion: Rol | null = null;
  todoSeleccionado = false;
  rolForm = {
    nombre: '',
    descripcion: '',
    permisosSeleccionados: new Set<string>()
  };

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.api.getPermisosDisponibles().subscribe({ next: data => this.catalogoPermisos = data });
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.api.getRoles().subscribe({
      next: data => { this.roles = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; }
    });
  }

  get permisosPorModulo(): { [modulo: string]: PermisoCatalogo[] } {
    return this.catalogoPermisos.reduce((acc, permiso) => {
      if (!acc[permiso.modulo]) acc[permiso.modulo] = [];
      acc[permiso.modulo].push(permiso);
      return acc;
    }, {} as { [modulo: string]: PermisoCatalogo[] });
  }

  get modulos(): string[] {
    return Object.keys(this.permisosPorModulo);
  }

  cantidadPermisos(rol: Rol): number {
    return rol.permisos.length;
  }

  esAccesoTotal(rol: Rol): boolean {
    return rol.permisos.includes('*');
  }

  etiquetaPermiso(clave: string): string {
    return this.catalogoPermisos.find(p => p.clave === clave)?.etiqueta || clave;
  }

  // ═══ Roles CRUD ═══
  abrirCrearRol() {
    this.rolEnEdicion = null;
    this.todoSeleccionado = false;
    this.rolForm = { nombre: '', descripcion: '', permisosSeleccionados: new Set<string>() };
    this.isRolModalOpen = true;
  }

  abrirEditarRol(rol: Rol) {
    this.rolEnEdicion = rol;
    this.todoSeleccionado = rol.permisos.includes('*');
    this.rolForm = {
      nombre: rol.nombre,
      descripcion: rol.descripcion || '',
      permisosSeleccionados: new Set<string>(this.todoSeleccionado ? [] : rol.permisos)
    };
    this.isRolModalOpen = true;
  }

  cerrarRolModal() {
    this.isRolModalOpen = false;
    this.rolEnEdicion = null;
    this.cdr.detectChanges();
  }

  togglePermiso(clave: string) {
    if (this.rolForm.permisosSeleccionados.has(clave)) {
      this.rolForm.permisosSeleccionados.delete(clave);
    } else {
      this.rolForm.permisosSeleccionados.add(clave);
    }
  }

  toggleTodoSeleccionado() {
    this.todoSeleccionado = !this.todoSeleccionado;
    if (this.todoSeleccionado) {
      this.rolForm.permisosSeleccionados.clear();
    }
  }

  async guardarRol() {
    if (!this.rolForm.nombre) {
      this.toast.error('El nombre es obligatorio');
      return;
    }

    this.savingRol = true;
    const payload = {
      nombre: this.rolForm.nombre,
      descripcion: this.rolForm.descripcion,
      permisos: this.todoSeleccionado ? ['*'] : Array.from(this.rolForm.permisosSeleccionados)
    };

    const obs = this.rolEnEdicion
      ? this.api.actualizarRol(this.rolEnEdicion.id, payload)
      : this.api.crearRol(payload);

    obs.subscribe({
      next: () => {
        this.savingRol = false;
        this.toast.success(this.rolEnEdicion ? '✓ Rol actualizado' : '✓ Rol creado');
        this.cerrarRolModal();
        this.loadAll();
      },
      error: () => {
        this.savingRol = false;
        this.toast.error('Ocurrió un error al guardar el rol');
      }
    });
  }

  async eliminarRol(rol: Rol) {
    if (rol.esSistema) return;

    const confirmado = await this.confirmDialog.confirm({
      title: 'Eliminar rol',
      message: `¿Deseas eliminar el rol "${rol.nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (!confirmado) return;

    this.api.eliminarRol(rol.id).subscribe({
      next: () => {
        this.toast.success('✓ Rol eliminado');
        this.loadAll();
      },
      error: (err) => {
        const mensaje = err?.error?.message || 'No se pudo eliminar el rol';
        this.toast.error(mensaje);
      }
    });
  }
}
