// Recursos Humanos: alta, edición, baja, horarios, calendario y nómina.
import { Component } from '@angular/core';
import { TablaTrabajadores } from './componentes/tabla-trabajadores/tabla-trabajadores';
import { TablaNomina } from './componentes/tabla-nomina/tabla-nomina';
import { CalendarioTrabajo } from './componentes/calendario-trabajo/calendario-trabajo';
import { DatosPagoSalario, FormularioPagoSalario } from './modales/formulario-pago-salario/formulario-pago-salario';
import { FormularioTrabajador } from './modales/formulario-trabajador/formulario-trabajador';
import { DatosTrabajador, PagoNomina, Trabajador } from './rh.models';
import { ContabilidadService } from '../compartidos/servicios/contabilidad.service';
import { RhService } from '../compartidos/servicios/rh.service';
import { AvisoService } from '../compartidos/servicios/aviso.service';

@Component({
  imports: [TablaTrabajadores, TablaNomina, CalendarioTrabajo, FormularioPagoSalario, FormularioTrabajador],
  selector: 'app-rh',
  styleUrl: './rh.css',
  templateUrl: './rh.html',
})
export class RH {
  constructor(
    private rhService: RhService,
    private contabilidadService: ContabilidadService,
    private aviso: AvisoService,
  ) {
    this.rhService.cargar();
    this.contabilidadService.cargar();
  }

  // La lista vive en el servicio.
  get trabajadores() {
    return this.rhService.trabajadores;
  }

  mostrarFormularioPago = false;
  mostrarFormularioTrabajador = false;
  trabajadorEnEdicion: Trabajador | null = null;

  abrirNuevo(): void {
    this.trabajadorEnEdicion = null;
    this.mostrarFormularioTrabajador = true;
  }

  editar(trabajador: Trabajador): void {
    this.trabajadorEnEdicion = trabajador;
    this.mostrarFormularioTrabajador = true;
  }

  // Datos, puesto, salario y horario.
  guardarTrabajador(datos: DatosTrabajador): void {
    const peticion = this.trabajadorEnEdicion
      ? this.rhService.editar(this.trabajadorEnEdicion, datos)
      : this.rhService.agregar(datos);
    peticion.subscribe({
      next: () => this.aviso.exito('Trabajador guardado.'),
      error: (e) => this.aviso.error(e.error?.mensaje ?? 'No se pudo guardar el trabajador.'),
    });
    this.mostrarFormularioTrabajador = false;
    this.trabajadorEnEdicion = null;
  }

  cambiarEstado(trabajador: Trabajador): void {
    this.rhService.cambiarEstado(trabajador).subscribe({
      next: (t) => this.aviso.exito(t.estado === 'baja' ? 'Trabajador dado de baja.' : 'Trabajador reactivado.'),
      error: (e) => this.aviso.error(e.error?.mensaje ?? 'No se pudo cambiar el estado.'),
    });
  }

  get activos(): number {
    return this.trabajadores().filter((t) => t.estado === 'activo').length;
  }

  get bajas(): number {
    return this.trabajadores().filter((t) => t.estado === 'baja').length;
  }

  get nombresActivos(): string[] {
    return this.trabajadores().filter((t) => t.estado === 'activo').map((t) => t.nombre);
  }

  get salarios(): Record<string, number> {
    return Object.fromEntries(this.trabajadores().map((t) => [t.nombre, t.salario]));
  }

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

  registrarPago(datos: DatosPagoSalario): void {
    if (!datos.trabajador || datos.monto <= 0 || datos.periodoFin < datos.periodoInicio) return;
    this.contabilidadService.registrarEgreso(
      `${datos.trabajador} · ${datos.periodoInicio} a ${datos.periodoFin}`,
      datos.monto,
      'Nómina',
    );
    this.aviso.exito('Pago de nómina registrado.');
    this.mostrarFormularioPago = false;
  }
}
