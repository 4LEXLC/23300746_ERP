// Cuentas de acceso al sistema (solo el administrador).
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from './api.config';

export interface Usuario {
  id_usuario: number;
  nombre_usuario: string;
  rol: 'admin' | 'cajero';
  activo: number | boolean;
}

export interface DatosUsuario {
  nombre_usuario: string;
  contrasena: string;
  rol: 'admin' | 'cajero';
  activo: boolean;
  id_trabajador: number | null;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly url = `${API_URL}/usuario`;

  usuarios = signal<Usuario[]>([]);

  constructor(private http: HttpClient) {}

  cargar(): void {
    this.http.get<Usuario[]>(this.url).subscribe((datos) => this.usuarios.set(datos));
  }

  agregar(datos: DatosUsuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, datos).pipe(
      tap((nuevo) => this.usuarios.update((lista) => [...lista, nuevo])),
    );
  }

  // Si la contraseña va vacía, el servidor conserva la que ya tenía.
  editar(id: number, datos: DatosUsuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}`, datos).pipe(
      tap((editado) => this.usuarios.update((lista) => lista.map((u) => (u.id_usuario === id ? editado : u)))),
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => this.usuarios.update((lista) => lista.filter((u) => u.id_usuario !== id))),
    );
  }
}
