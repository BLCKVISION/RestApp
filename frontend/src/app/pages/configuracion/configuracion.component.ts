import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare const gsap: any;

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss',
})
export class ConfiguracionComponent implements AfterViewInit {
  activeTab: 'perfil' | 'sistema' | 'notificaciones' | 'portal' = 'perfil';

  ngAfterViewInit() {
    gsap.fromTo('.page__title, .page__subtitle', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
    gsap.fromTo('.config-nav__btn', 
      { opacity: 0, x: -15 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
    );
    gsap.fromTo('.config-card', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.1, clearProps: 'transform' }
    );
  }

  perfilForm = {
    nombre: 'Administrador',
    email: 'admin@restapp.com',
    telefono: '',
  };

  sistemaForm = {
    idioma: 'es',
    zona: 'America/Caracas',
    formatoFecha: 'DD/MM/YYYY',
  };

  notifForm = {
    email: true,
    push: false,
    pedidosNuevos: true,
    stockBajo: true,
    reportesSemanales: false,
  };

  portalForm = {
    activo: true,
    mensajeBienvenida: 'Formulario de requerimiento para organizaciones',
    requerirUbicacion: true
  };

  saving = false;

  save() {
    this.saving = true;
    setTimeout(() => { this.saving = false; }, 1200);
  }
}
