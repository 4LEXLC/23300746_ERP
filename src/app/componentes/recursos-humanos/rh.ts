// Recursos Humanos: solo consulta de trabajadores.
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TablaTrabajadores } from './componentes/tabla-trabajadores/tabla-trabajadores';
import { Trabajador } from './rh.models';
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

@Component({
  imports: [TablaTrabajadores],
  selector: 'app-rh',
  styleUrl: './rh.css',
  templateUrl: './rh.html',
})
export class RH {
  private readonly urlTrabajador = `${API_URL}/trabajador`;

  constructor(private http: HttpClient) {
    this.cargarTrabajadores();
  }

  trabajadores: Trabajador[] = [];

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

  // Cuenta los trabajadores activos.
  get activos(): number {
    return this.trabajadores.filter((t) => t.estado === 'activo').length;
  }

  // Cuenta los trabajadores dados de baja.
  get bajas(): number {
    return this.trabajadores.filter((t) => t.estado === 'baja').length;
  }
}
