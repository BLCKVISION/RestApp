/** Usuarios en memoria — será reemplazado por TypeORM repo */
export interface IUsuario {
  id: string;
  username: string;
  passwordHash: string;
  nombre: string;
  role: string;
}

// Contraseñas: admin123 / operador123 (hasheadas con bcrypt)
export const USERS: IUsuario[] = [
  {
    id: '1',
    username: 'admin',
    passwordHash: '$2b$10$Y2/4EuiuhxFV76OVDWd6xulIup..2Y3jVFo.XPMCSLFhJZZiUJgN2',
    nombre: 'Admin',
    role: 'Administrador',
  },
];
