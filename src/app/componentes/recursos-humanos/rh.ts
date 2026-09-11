// Trabajadores, asistencias, permisos y nómina.
import { Component } from '@angular/core';
import { DatosTrabajador, FormularioTrabajador } from './modales/formulario-trabajador/formulario-trabajador';
import { DatosPermiso, FormularioPermiso } from './modales/formulario-permiso/formulario-permiso';
import { DatosPagoSalario, FormularioPagoSalario } from './modales/formulario-pago-salario/formulario-pago-salario';
import { TablaTrabajadores } from './componentes/tabla-trabajadores/tabla-trabajadores';
import { ListaAsistencias } from './componentes/lista-asistencias/lista-asistencias';
import { ListaPermisos } from './componentes/lista-permisos/lista-permisos';
import { TablaNomina } from './componentes/tabla-nomina/tabla-nomina';
import { Asistencia, PagoNomina, Permiso, Trabajador } from './rh.models';
import { ContabilidadService } from '../compartidos/servicios/contabilidad.service';

@Component({
  imports: [
    FormularioTrabajador,
    FormularioPermiso,
    FormularioPagoSalario,
    TablaTrabajadores,
    ListaAsistencias,
    ListaPermisos,
    TablaNomina,
  ],
  selector: 'app-rh',
  styleUrl: './rh.css',
  templateUrl: './rh.html',
})
export class RH {
  constructor(private contabilidadService: ContabilidadService) {}

  trabajadores: Trabajador[] = [
    { nombre: 'Ana López', correo: 'ana.lopez@cafeteria.mx', puesto: 'Barista', salario: 6500, horario: 'Lun–Vie · 08:00-16:00', estado: 'activo' },
    { nombre: 'Carlos Ramírez', correo: 'carlos.ramirez@cafeteria.mx', puesto: 'Cajero', salario: 6000, horario: 'Lun–Vie · 09:00-17:00', estado: 'activo' },
    { nombre: 'María Torres', correo: 'maria.torres@cafeteria.mx', puesto: 'Repostero(a)', salario: 7200, horario: 'Mar–Sáb · 07:00-15:00', estado: 'activo' },
    { nombre: 'Jorge Medina', correo: 'jorge.medina@cafeteria.mx', puesto: 'Barista', salario: 6500, horario: 'Mié–Dom · 12:00-20:00', estado: 'activo' },
    { nombre: 'Sofía Herrera', correo: 'sofia.herrera@cafeteria.mx', puesto: 'Encargado(a) de turno', salario: 8500, horario: 'Lun–Vie · 08:00-16:00', estado: 'activo' },
    { nombre: 'Luis Domínguez', correo: 'luis.dominguez@cafeteria.mx', puesto: 'Cajero', salario: 6000, horario: 'Lun–Vie · 14:00-22:00', estado: 'baja' },
  ];

  mostrarFormularioTrabajador = false;
  mostrarFormularioPermiso = false;
  mostrarFormularioPagoSalario = false;
  trabajadorEnEdicion: Trabajador | null = null;

  // Cuenta los trabajadores activos.
  get activos(): number {
    return this.trabajadores.filter((t) => t.estado === 'activo').length;
  }

  // Cuenta los trabajadores dados de baja.
  get bajas(): number {
    return this.trabajadores.filter((t) => t.estado === 'baja').length;
  }

  // Lista los nombres de los trabajadores activos.
  get nombresTrabajadores(): string[] {
    return this.trabajadores.filter((t) => t.estado === 'activo').map((t) => t.nombre);
  }

  asistencias: Asistencia[] = [
    { nombre: 'Ana López', detalle: 'Entrada 07:58 · Turno 08:00-16:00', estado: 'a-tiempo' },
    { nombre: 'Carlos Ramírez', detalle: 'Entrada 09:12 · Turno 09:00-17:00', estado: 'retardo' },
    { nombre: 'María Torres', detalle: 'Entrada 07:02 · Turno 07:00-15:00', estado: 'a-tiempo' },
    { nombre: 'Jorge Medina', detalle: 'Sin registro de entrada', estado: 'falta' },
  ];

  permisos: Permiso[] = [
    { nombre: 'Sofía Herrera', tipo: 'Vacaciones', fechas: '2026-09-14 — 2026-09-20', estado: 'pendiente' },
    { nombre: 'Jorge Medina', tipo: 'Permiso', fechas: '2026-09-08 — 2026-09-08', estado: 'aprobado' },
  ];

  // Cuenta las solicitudes pendientes.
  get permisosPendientes(): number {
    return this.permisos.filter((p) => p.estado === 'pendiente').length;
  }

  pagos: PagoNomina[] = [
    { trabajador: 'Ana López', puesto: 'Barista', periodo: '2026-08-24 — 2026-08-30', monto: 1500, fechaPago: '—', estado: 'pendiente' },
    { trabajador: 'Carlos Ramírez', puesto: 'Cajero', periodo: '2026-08-24 — 2026-08-30', monto: 1385, fechaPago: '—', estado: 'pendiente' },
    { trabajador: 'María Torres', puesto: 'Repostera', periodo: '2026-08-17 — 2026-08-23', monto: 1660, fechaPago: '2026-08-24', estado: 'pagado' },
  ];

  // Lista los trabajadores con pagos pendientes.
  get trabajadoresConPagoPendiente(): string[] {
    return this.pagos.filter((p) => p.estado === 'pendiente').map((p) => p.trabajador);
  }

  // Abre el formulario para registrar un trabajador.
  abrirNuevoTrabajador(): void {
    this.trabajadorEnEdicion = null;
    this.mostrarFormularioTrabajador = true;
  }

  // Carga el trabajador elegido en el formulario.
  editarTrabajador(trabajador: Trabajador): void {
    this.trabajadorEnEdicion = trabajador;
    this.mostrarFormularioTrabajador = true;
  }

  // Crea o actualiza el trabajador y su horario.
  guardarTrabajador(datos: DatosTrabajador): void {
    const horario = `${datos.dias} · ${datos.horaEntrada}-${datos.horaSalida}`;
    if (this.trabajadorEnEdicion) {
      const nombreEnEdicion = this.trabajadorEnEdicion.nombre;
      this.trabajadores = this.trabajadores.map((t) =>
        t.nombre === nombreEnEdicion
          ? { ...t, puesto: datos.puesto, salario: datos.salario, horario, correo: datos.correo || t.correo }
          : t,
      );
    } else {
      this.trabajadores = [
        ...this.trabajadores,
        {
          nombre: datos.nombre,
          correo: datos.correo || '—',
          puesto: datos.puesto,
          salario: datos.salario,
          horario,
          estado: 'activo',
        },
      ];
    }
    this.trabajadorEnEdicion = null;
    this.mostrarFormularioTrabajador = false;
  }

  // Guarda una solicitud pendiente de aprobación.
  agregarPermiso(datos: DatosPermiso): void {
    this.permisos = [
      ...this.permisos,
      {
        nombre: datos.trabajador,
        tipo: datos.tipo,
        fechas: `${datos.fechaInicio} — ${datos.fechaFin}`,
        estado: 'pendiente',
      },
    ];
    this.mostrarFormularioPermiso = false;
  }

  // Actualiza la nómina y registra el egreso del salario.
  registrarPagoSalario(datos: DatosPagoSalario): void {
    const periodo = `${datos.periodoInicio} — ${datos.periodoFin}`;
    const tienePendiente = this.pagos.some((p) => p.trabajador === datos.trabajador && p.estado === 'pendiente');

    if (tienePendiente) {
      this.pagos = this.pagos.map((p) =>
        p.trabajador === datos.trabajador && p.estado === 'pendiente'
          ? { ...p, periodo, monto: datos.monto, fechaPago: datos.fechaPago, estado: 'pagado' }
          : p,
      );
    } else {
      const trabajador = this.trabajadores.find((t) => t.nombre === datos.trabajador);
      this.pagos = [
        ...this.pagos,
        {
          trabajador: datos.trabajador,
          puesto: trabajador?.puesto ?? '—',
          periodo,
          monto: datos.monto,
          fechaPago: datos.fechaPago,
          estado: 'pagado',
        },
      ];
    }
    this.contabilidadService.registrarEgreso(`Nómina — ${datos.trabajador}`, datos.monto, 'Nómina');
    this.mostrarFormularioPagoSalario = false;
  }

  // Marca la solicitud como aprobada.
  aprobarPermiso(permiso: Permiso): void {
    this.permisos = this.permisos.map((p) => (p === permiso ? { ...p, estado: 'aprobado' } : p));
  }

  // Marca la solicitud como rechazada.
  rechazarPermiso(permiso: Permiso): void {
    this.permisos = this.permisos.map((p) => (p === permiso ? { ...p, estado: 'rechazado' } : p));
  }

  // Alterna entre activo y baja.
  cambiarEstadoTrabajador(trabajador: Trabajador): void {
    this.trabajadores = this.trabajadores.map((t) =>
      t === trabajador ? { ...t, estado: t.estado === 'activo' ? 'baja' : 'activo' } : t,
    );
  }

  /** true si, según los días de su horario (p. ej. "Lun–Vie"), le toca trabajar hoy. */
  private trabajaHoy(trabajador: Trabajador): boolean {
    const ORDEN_DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const ABREV_POR_GETDAY = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const rangoDias = trabajador.horario.split(' · ')[0] ?? '';
    const [inicio, fin] = rangoDias.split('–').map((d) => d.trim());
    const indiceInicio = ORDEN_DIAS.indexOf(inicio);
    const indiceFin = ORDEN_DIAS.indexOf(fin);
    if (indiceInicio === -1 || indiceFin === -1) return true; // formato desconocido: no bloquear

    const indiceHoy = ORDEN_DIAS.indexOf(ABREV_POR_GETDAY[new Date().getDay()]);
    return indiceInicio <= indiceFin
      ? indiceHoy >= indiceInicio && indiceHoy <= indiceFin
      : indiceHoy >= indiceInicio || indiceHoy <= indiceFin;
  }

  // Registra la entrada y determina puntualidad o jornada extra.
  registrarAsistencia(trabajador: Trabajador): void {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
    const fecha = ahora.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
    const diaSemana = ahora.toLocaleDateString('es-MX', { weekday: 'long' });
    const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
    const turno = trabajador.horario.split(' · ')[1] ?? '—';

    let registro: Asistencia;

    if (!this.trabajaHoy(trabajador)) {
      registro = {
        nombre: trabajador.nombre,
        detalle: `Entrada ${diaCapitalizado} ${fecha}, ${hora} · Fuera de su horario habitual (${trabajador.horario})`,
        estado: 'extra',
      };
    } else {
      const [horaEntradaProgramada] = turno.split('-');
      const retardo = horaEntradaProgramada ? hora > horaEntradaProgramada.trim() : false;
      registro = {
        nombre: trabajador.nombre,
        detalle: `Entrada ${diaCapitalizado} ${fecha}, ${hora} · Turno ${turno}`,
        estado: retardo ? 'retardo' : 'a-tiempo',
      };
    }

    const existe = this.asistencias.some((a) => a.nombre === trabajador.nombre);
    this.asistencias = existe
      ? this.asistencias.map((a) => (a.nombre === trabajador.nombre ? registro : a))
      : [registro, ...this.asistencias];
  }
}
