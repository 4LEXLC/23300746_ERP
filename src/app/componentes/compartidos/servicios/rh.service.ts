// Trabajadores contra el backend.
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { API_URL } from './api.config';
import { DatosTrabajador, Trabajador } from '../../recursos-humanos/rh.models';

interface TrabajadorBackend {
  id_trabajador: number;
  id_usuario: number | null;
  id_puesto: number | null;
  puesto: string | null;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  salario: string | number;
  fecha_contratacion: string | null;
  estado: 'activo' | 'baja';
  dia: string | null;
  hora_entrada: string | null;
  hora_salida: string | null;
}

@Injectable({ providedIn: 'root' })
export class RhService {
  private readonly url = `${API_URL}/trabajador`;

  trabajadores = signal<Trabajador[]>([]);

  constructor(private http: HttpClient) {}

  cargar(): void {
    this.http.get<TrabajadorBackend[]>(this.url).subscribe((datos) => {
      this.trabajadores.set(datos.map((t) => this.aFrontend(t)));
    });
  }

  private aFrontend(t: TrabajadorBackend): Trabajador {
    const entrada = (t.hora_entrada ?? '').slice(0, 5);
    const salida = (t.hora_salida ?? '').slice(0, 5);
    return {
      id_trabajador: t.id_trabajador,
      id_usuario: t.id_usuario,
      id_puesto: t.id_puesto ?? undefined,
      nombre: t.nombre,
      telefono: t.telefono ?? '',
      correo: t.correo || '—',
      puesto: t.puesto || '—',
      salario: Number(t.salario),
      fechaContratacion: t.fecha_contratacion ? t.fecha_contratacion.slice(0, 10) : '',
      dias: t.dia ?? '',
      horaEntrada: entrada,
      horaSalida: salida,
      horario: t.dia ? `${t.dia} · ${entrada}-${salida}` : '—',
      estado: t.estado,
    };
  }

  // Se manda el id_usuario que ya tenía para no romper la liga con sus ventas.
  private aBackend(d: DatosTrabajador, base?: Trabajador) {
    return {
      id_usuario: base?.id_usuario ?? null,
      nombre: d.nombre.trim(),
      telefono: d.telefono || null,
      correo: d.correo || null,
      puesto: d.puesto,
      salario: d.salario,
      fecha_contratacion: d.fechaContratacion,
      estado: base?.estado ?? 'activo',
      dia: d.dias,
      hora_entrada: d.horaEntrada,
      hora_salida: d.horaSalida,
    };
  }

  private reemplazar(editado: Trabajador): void {
    this.trabajadores.update((lista) => lista.map((t) => (t.id_trabajador === editado.id_trabajador ? editado : t)));
  }

  agregar(datos: DatosTrabajador): Observable<Trabajador> {
    return this.http.post<TrabajadorBackend>(this.url, this.aBackend(datos)).pipe(
      map((t) => this.aFrontend(t)),
      tap((nuevo) => this.trabajadores.update((lista) => [...lista, nuevo])),
    );
  }

  editar(trabajador: Trabajador, datos: DatosTrabajador): Observable<Trabajador> {
    return this.http.put<TrabajadorBackend>(`${this.url}/${trabajador.id_trabajador}`, this.aBackend(datos, trabajador)).pipe(
      map((t) => this.aFrontend(t)),
      tap((editado) => this.reemplazar(editado)),
    );
  }

  // Baja lógica. No se borra porque sus ventas siguen ligadas.
  cambiarEstado(trabajador: Trabajador): Observable<Trabajador> {
    const datos: DatosTrabajador = {
      nombre: trabajador.nombre,
      telefono: trabajador.telefono ?? '',
      correo: trabajador.correo === '—' ? '' : trabajador.correo,
      puesto: trabajador.puesto,
      salario: trabajador.salario,
      fechaContratacion: trabajador.fechaContratacion ?? '',
      dias: trabajador.dias ?? '',
      horaEntrada: trabajador.horaEntrada ?? '',
      horaSalida: trabajador.horaSalida ?? '',
    };
    const cuerpo = { ...this.aBackend(datos, trabajador), estado: trabajador.estado === 'activo' ? 'baja' : 'activo' };
    return this.http.put<TrabajadorBackend>(`${this.url}/${trabajador.id_trabajador}`, cuerpo).pipe(
      map((t) => this.aFrontend(t)),
      tap((editado) => this.reemplazar(editado)),
    );
  }
}
