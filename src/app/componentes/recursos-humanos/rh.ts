// Recursos Humanos: solo consulta de trabajadores, asistencias, permisos y nómina.
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TablaTrabajadores } from './componentes/tabla-trabajadores/tabla-trabajadores';
import { ListaAsistencias } from './componentes/lista-asistencias/lista-asistencias';
import { ListaPermisos } from './componentes/lista-permisos/lista-permisos';
import { TablaNomina } from './componentes/tabla-nomina/tabla-nomina';
import { Asistencia, PagoNomina, Permiso, Trabajador } from './rh.models';
import { API_URL } from '../compartidos/servicios/api.config';

interface TrabajadorBackend {
  id_trabajador: number;
  id_puesto: number | null;
  puesto: string | null;
  nombre: string;
  correo: string | null;
  salario: string | number;
  estado: 'activo' | 'baja';
  dia: string | null;
  hora_entrada: string | null;
  hora_salida: string | null;
}

interface AsistenciaBackend {
  id_asistencia: number;
  id_trabajador: number;
  nombre: string;
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  estado: string;
}

interface PermisoBackend {
  id_permiso: number;
  id_trabajador: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: string;
  motivo: string | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
}

@Component({
  imports: [TablaTrabajadores, ListaAsistencias, ListaPermisos, TablaNomina],
  selector: 'app-rh',
  styleUrl: './rh.css',
  templateUrl: './rh.html',
})
export class RH {
  private readonly urlTrabajador = `${API_URL}/trabajador`;
  private readonly urlAsistencia = `${API_URL}/asistencia`;
  private readonly urlPermiso = `${API_URL}/permiso`;

  constructor(private http: HttpClient) {
    this.cargarTrabajadores();
    this.cargarAsistencias();
    this.cargarPermisos();
  }

  trabajadores: Trabajador[] = [];
  asistencias: Asistencia[] = [];
  permisos: Permiso[] = [];

  // No existe una tabla de nómina en el esquema; esta lista queda vacía por ahora.
  pagos: PagoNomina[] = [];

  private cargarTrabajadores(): void {
    this.http.get<TrabajadorBackend[]>(this.urlTrabajador).subscribe((datos) => {
      this.trabajadores = datos.map((t) => this.trabajadorAFrontend(t));
    });
  }

  private trabajadorAFrontend(t: TrabajadorBackend): Trabajador {
    const horario = t.dia ? `${t.dia} · ${(t.hora_entrada ?? '').slice(0, 5)}-${(t.hora_salida ?? '').slice(0, 5)}` : '—';
    return {
      id_trabajador: t.id_trabajador,
      id_puesto: t.id_puesto ?? undefined,
      nombre: t.nombre,
      correo: t.correo || '—',
      puesto: t.puesto || '—',
      salario: Number(t.salario),
      horario,
      estado: t.estado,
    };
  }

  private cargarAsistencias(): void {
    const hoy = new Date().toISOString().slice(0, 10);
    this.http.get<AsistenciaBackend[]>(this.urlAsistencia).subscribe((datos) => {
      this.asistencias = datos
        .filter((a) => (a.fecha ?? '').toString().slice(0, 10) === hoy)
        .map((a) => this.asistenciaAFrontend(a));
    });
  }

  private asistenciaAFrontend(a: AsistenciaBackend): Asistencia {
    const trabajador = this.trabajadores.find((t) => t.id_trabajador === a.id_trabajador);
    const turno = trabajador?.horario.split(' · ')[1] ?? '—';
    const detalle =
      a.estado === 'falta'
        ? 'Sin registro de entrada'
        : `Entrada ${(a.hora_entrada ?? '').slice(0, 5)} · Turno ${turno}`;
    return {
      id_asistencia: a.id_asistencia,
      id_trabajador: a.id_trabajador,
      nombre: a.nombre,
      detalle,
      estado: a.estado as Asistencia['estado'],
    };
  }

  private cargarPermisos(): void {
    this.http.get<PermisoBackend[]>(this.urlPermiso).subscribe((datos) => {
      this.permisos = datos.map((p) => this.permisoAFrontend(p));
    });
  }

  private permisoAFrontend(p: PermisoBackend): Permiso {
    return {
      id_permiso: p.id_permiso,
      id_trabajador: p.id_trabajador,
      nombre: p.nombre,
      tipo: p.tipo,
      fechas: `${(p.fecha_inicio ?? '').toString().slice(0, 10)} — ${(p.fecha_fin ?? '').toString().slice(0, 10)}`,
      estado: p.estado,
    };
  }

  // Cuenta los trabajadores activos.
  get activos(): number {
    return this.trabajadores.filter((t) => t.estado === 'activo').length;
  }

  // Cuenta los trabajadores dados de baja.
  get bajas(): number {
    return this.trabajadores.filter((t) => t.estado === 'baja').length;
  }

  // Cuenta las solicitudes pendientes.
  get permisosPendientes(): number {
    return this.permisos.filter((p) => p.estado === 'pendiente').length;
  }

  // Lista los trabajadores con pagos pendientes (siempre vacía; no hay tabla de nómina).
  get trabajadoresConPagoPendiente(): string[] {
    return this.pagos.filter((p) => p.estado === 'pendiente').map((p) => p.trabajador);
  }
}
