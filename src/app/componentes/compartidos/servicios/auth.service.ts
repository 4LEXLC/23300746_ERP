import { Injectable } from '@angular/core';

export type Rol = 'admin' | 'cliente';

export interface UsuarioSesion {
  usuario: string;
  nombre: string;
  rol: Rol;
}

interface CredencialDemo {
  usuario: string;
  contrasena: string;
  nombre: string;
  rol: Rol;
}

/** Usuarios de demostración: temporales, solo en memoria (no hay base de datos real detrás). */
const USUARIOS_DEMO: CredencialDemo[] = [
  { usuario: 'admin', contrasena: 'admin123', nombre: 'Administrador', rol: 'admin' },
  { usuario: 'cliente', contrasena: 'cliente123', nombre: 'Cliente', rol: 'cliente' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  usuarioActual: UsuarioSesion | null = null;

  iniciarSesion(usuario: string, contrasena: string): UsuarioSesion | null {
    const encontrado = USUARIOS_DEMO.find(
      (u) => u.usuario.toLowerCase() === usuario.trim().toLowerCase() && u.contrasena === contrasena,
    );
    if (!encontrado) return null;

    this.usuarioActual = { usuario: encontrado.usuario, nombre: encontrado.nombre, rol: encontrado.rol };
    return this.usuarioActual;
  }

  cerrarSesion(): void {
    this.usuarioActual = null;
  }

  get esAdmin(): boolean {
    return this.usuarioActual?.rol === 'admin';
  }

  get nombreMostrado(): string {
    return this.usuarioActual?.nombre ?? 'Invitado';
  }

  get rolMostrado(): string {
    return this.usuarioActual?.rol === 'admin' ? 'Administrador' : this.usuarioActual?.rol === 'cliente' ? 'Cliente' : 'Invitado';
  }
}
