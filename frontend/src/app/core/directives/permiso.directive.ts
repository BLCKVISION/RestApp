import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appPermiso]',
  standalone: true,
})
export class PermisoDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private auth = inject(AuthService);

  private hasView = false;

  @Input() set appPermiso(clave: string) {
    const tienePermiso = this.auth.hasPermission(clave);
    if (tienePermiso && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!tienePermiso && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
