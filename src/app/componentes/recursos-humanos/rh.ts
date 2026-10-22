// Recursos Humanos: solo consulta de trabajadores.
import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TablaTrabajadores } from './componentes/tabla-trabajadores/tabla-trabajadores';
import { TablaNomina } from './componentes/tabla-nomina/tabla-nomina';
import { DatosPagoSalario, FormularioPagoSalario } from './modales/formulario-pago-salario/formulario-pago-salario';
import { PagoNomina, Trabajador } from './rh.models';
import { API_URL } from '../compartidos/servicios/api.config';
import { ContabilidadService } from '../compartidos/servicios/contabilidad.service';

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
  imports: [TablaTrabajadores, TablaNomina, FormularioPagoSalario],
  selector: 'app-rh',
  styleUrl: './rh.css',
  templateUrl: './rh.html',
})
export class RH {
  private readonly urlTrabajador = `${API_URL}/trabajador`;

  constructor(
    private http: HttpClient,
    private contabilidadService: ContabilidadService,
  ) {
    this.cargarTrabajadores();
  }

  trabajadores = signal<Trabajador[]>([]);
  mostrarFormularioPago = false;

  private cargarTrabajadores(): void {
    this.http.get<TrabajadorBackend[]>(this.urlTrabajador).subscribe((datos) => {
      this.trabajadores.set(datos.map((t) => this.trabajadorAFrontend(t)));
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
    return this.trabajadores().filter((t) => t.estado === 'activo').length;
  }

  // Cuenta los trabajadores dados de baja.
  get bajas(): number {
    return this.trabajadores().filter((t) => t.estado === 'baja').length;
  }

  // Nombres de los trabajadores activos que pueden recibir pago.
  get nombresActivos(): string[] {
    return this.trabajadores().filter((t) => t.estado === 'activo').map((t) => t.nombre);
  }

  // Salario registrado de cada trabajador activo, para sugerir el monto.
  get salarios(): Record<string, number> {
    return Object.fromEntries(this.trabajadores().map((t) => [t.nombre, t.salario]));
  }

  // Pagos de nómina registrados como egresos de categoría Nómina.
  get pagosNomina(): PagoNomina[] {
    return this.contabilidadService
      .movimientos()
      .filter((m) => m.tipo === 'egreso' && m.categoria === 'Nómina')
      .map((m) => {
        const [nombre, periodo] = m.concepto.split(' · ');
        const trabajador = this.trabajadores().find((t) => t.nombre === nombre);
        return {
          trabajador: nombre,
          puesto: trabajador?.puesto ?? '—',
          periodo: periodo ?? '—',
          monto: m.monto,
          fechaPago: m.fecha,
          estado: 'pagado' as const,
        };
      });
  }

  // Registra el pago como egreso de Nómina en contabilidad.
  registrarPago(datos: DatosPagoSalario): void {
    if (!datos.trabajador || datos.monto <= 0 || datos.periodoFin < datos.periodoInicio) return;
    this.contabilidadService.registrarEgreso(
      `${datos.trabajador} · ${datos.periodoInicio} a ${datos.periodoFin}`,
      datos.monto,
      'Nómina',
    );
    this.mostrarFormularioPago = false;
  }
}
