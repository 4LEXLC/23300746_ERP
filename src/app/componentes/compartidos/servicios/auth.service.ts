// Sesión simple: solo valida usuario y contraseña contra la tabla usuario.
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { API_URL } from './api.config';

interface RespuestaLogin {
  id_usuario: number;
  nombre_usuario: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${API_URL}/usuario`;

  usuarioActual: string | null = null;

  constructor(private http: HttpClient) {}

  // Valida usuario y contraseña contra el backend e inicia la sesión.
  iniciarSesion(usuario: string, contrasena: string): Observable<boolean> {
    return this.http
      .post<RespuestaLogin>(`${this.apiUrl}/login`, {
        nombre_usuario: usuario.trim(),
        contrasena,
      })
      .pipe(
        map((respuesta) => {
          this.usuarioActual = respuesta.nombre_usuario;
          return true;
        }),
        catchError(() => of(false)),
      );
  }

  // Cierra la sesión actual.
  cerrarSesion(): void {
    this.usuarioActual = null;
  }

  // Devuelve el nombre del usuario o Invitado.
  get nombreMostrado(): string {
    return this.usuarioActual ?? 'Invitado';
  }

  // Placeholder: el backend aún no maneja roles de usuario.
  get rolMostrado(): string {
    return 'Sin rol asignado';
  }
}
