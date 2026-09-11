// Sesión y credenciales de demostración en memoria.
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

  // Valida las credenciales e inicia la sesión.
  iniciarSesion(usuario: string, contrasena: string): UsuarioSesion | null {
    const encontrado = USUARIOS_DEMO.find(
      (u) => u.usuario.toLowerCase() === usuario.trim().toLowerCase() && u.contrasena === contrasena,
    );
    if (!encontrado) return null;

    this.usuarioActual = { usuario: encontrado.usuario, nombre: encontrado.nombre, rol: encontrado.rol };
    return this.usuarioActual;
  }

  // Cierra la sesión actual.
  cerrarSesion(): void {
    this.usuarioActual = null;
  }

  // Indica si la sesión tiene rol de administrador.
  get esAdmin(): boolean {
    return this.usuarioActual?.rol === 'admin';
  }

  // Devuelve el nombre del usuario o Invitado.
  get nombreMostrado(): string {
    return this.usuarioActual?.nombre ?? 'Invitado';
  }

  // Devuelve la etiqueta del rol actual.
  get rolMostrado(): string {
    return this.usuarioActual?.rol === 'admin' ? 'Administrador' : this.usuarioActual?.rol === 'cliente' ? 'Cliente' : 'Invitado';
  }
}
