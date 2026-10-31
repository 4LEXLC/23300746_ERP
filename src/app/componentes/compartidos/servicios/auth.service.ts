// Sesión con JWT: guarda token, rol y nombre en localStorage.
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { API_URL } from './api.config';

interface RespuestaLogin {
  token: string;
  nombre_usuario: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${API_URL}/usuario`;
  private readonly http = inject(HttpClient);
  // En SSR no existe localStorage, por eso se revisa si estamos en el navegador.
  private readonly esNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  // Manda las credenciales al backend y guarda la sesión si son correctas.
  iniciarSesion(usuario: string, contrasena: string): Observable<boolean> {
    return this.http
      .post<RespuestaLogin>(`${this.apiUrl}/login`, { nombre_usuario: usuario.trim(), contrasena })
      .pipe(
        map((respuesta) => {
          localStorage.setItem('token', respuesta.token);
          localStorage.setItem('rol', respuesta.rol);
          localStorage.setItem('nombre', respuesta.nombre_usuario);
          return true;
        }),
        catchError(() => of(false)),
      );
  }

  private leer(clave: string): string | null {
    return this.esNavegador ? localStorage.getItem(clave) : null;
  }

  obtenerToken(): string | null {
    return this.leer('token');
  }

  obtenerRol(): string | null {
    return this.leer('rol');
  }

  // Revisa que exista el token y que no haya expirado.
  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp * 1000 > Date.now()) return true;
    } catch {}
    this.cerrarSesion();
    return false;
  }

  tieneRol(roles: string[]): boolean {
    const rol = this.obtenerRol();
    return rol !== null && roles.includes(rol);
  }

  cerrarSesion(): void {
    if (!this.esNavegador) return;
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
  }

  get nombreMostrado(): string {
    return this.leer('nombre') ?? 'Invitado';
  }

  get rolMostrado(): string {
    const etiquetas: Record<string, string> = { admin: 'Administrador', cajero: 'Cajero' };
    const rol = this.leer('rol');
    return rol ? (etiquetas[rol] ?? rol) : 'Sin rol asignado';
  }
}