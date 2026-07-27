import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { Usuario, Rol } from '../../core/models/models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  loading = true;

  // ─── Usuario modal ───
  isUsuarioModalOpen = false;
  savingUsuario = false;
  usuarioEnEdicion: Usuario | null = null;
  usuarioForm = {
    username: '',
    password: '',
    nombre: '',
    rolId: '',
    activo: true
  };

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.api.getRoles().subscribe({ next: data => this.roles = data });
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.api.getUsuarios().subscribe({
      next: data => { this.usuarios = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; }
    });
  }

  getRolNombre(rolId: string): string {
    return this.roles.find(r => r.id === rolId)?.nombre || rolId;
  }

  esUsuarioActual(usuario: Usuario): boolean {
    return usuario.id === this.auth.currentUser()?.id;
  }

  // ═══ Usuarios CRUD ═══
  abrirCrearUsuario() {
    this.usuarioEnEdicion = null;
    this.usuarioForm = { username: '', password: '', nombre: '', rolId: '', activo: true };
    this.isUsuarioModalOpen = true;
  }

  abrirEditarUsuario(usuario: Usuario) {
    this.usuarioEnEdicion = usuario;
    this.usuarioForm = {
      username: usuario.username,
      password: '',
      nombre: usuario.nombre,
      rolId: usuario.rolId,
      activo: usuario.activo
    };
    this.isUsuarioModalOpen = true;
  }

  cerrarUsuarioModal() {
    this.isUsuarioModalOpen = false;
    this.usuarioEnEdicion = null;
    this.cdr.detectChanges();
  }

  async guardarUsuario() {
    if (!this.usuarioForm.username || !this.usuarioForm.nombre || !this.usuarioForm.rolId) {
      this.toast.error('Usuario, nombre y rol son obligatorios');
      return;
    }
    if (!this.usuarioEnEdicion && !this.usuarioForm.password) {
      this.toast.error('La contraseña es obligatoria para crear un usuario');
      return;
    }

    this.savingUsuario = true;

    if (this.usuarioEnEdicion) {
      const payload: any = {
        nombre: this.usuarioForm.nombre,
      };
      if (!this.esUsuarioActual(this.usuarioEnEdicion)) {
        payload.rolId = this.usuarioForm.rolId;
        payload.activo = this.usuarioForm.activo;
      }
      if (this.usuarioForm.password) {
        payload.password = this.usuarioForm.password;
      }
      this.api.actualizarUsuario(this.usuarioEnEdicion.id, payload).subscribe({
        next: () => {
          this.savingUsuario = false;
          this.toast.success('✓ Usuario actualizado');
          this.cerrarUsuarioModal();
          this.loadAll();
        },
        error: () => {
          this.savingUsuario = false;
          this.toast.error('Ocurrió un error al guardar el usuario');
        }
      });
    } else {
      const payload = {
        username: this.usuarioForm.username,
        password: this.usuarioForm.password,
        nombre: this.usuarioForm.nombre,
        rolId: this.usuarioForm.rolId
      };
      this.api.crearUsuario(payload).subscribe({
        next: () => {
          this.savingUsuario = false;
          this.toast.success('✓ Usuario creado');
          this.cerrarUsuarioModal();
          this.loadAll();
        },
        error: () => {
          this.savingUsuario = false;
          this.toast.error('Ocurrió un error al guardar el usuario');
        }
      });
    }
  }

  async eliminarUsuario(usuario: Usuario) {
    if (this.esUsuarioActual(usuario)) return;

    const confirmado = await this.confirmDialog.confirm({
      title: 'Eliminar usuario',
      message: `¿Deseas eliminar al usuario "${usuario.username}"? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (!confirmado) return;

    this.api.eliminarUsuario(usuario.id).subscribe({
      next: () => {
        this.toast.success('✓ Usuario eliminado');
        this.loadAll();
      },
      error: (err) => {
        const mensaje = err?.error?.message || 'No se pudo eliminar el usuario';
        this.toast.error(mensaje);
      }
    });
  }
}
