// Resumen inicial y accesos a los módulos.
import { Component, LOCALE_ID } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
import { RouterLink } from '@angular/router';
import { AuthService } from '../compartidos/servicios/auth.service';
import { VentasService } from '../compartidos/servicios/ventas.service';
import { ContabilidadService } from '../compartidos/servicios/contabilidad.service';
import { InventarioService } from '../compartidos/servicios/inventario.service';
import { RhService } from '../compartidos/servicios/rh.service';

registerLocaleData(localeEsMx);

interface Estadistica {
  etiqueta: string;
  valor: string;
  tendencia?: string;
  alerta?: boolean;
}

interface Modulo {
  ruta: string;
  clase: string;
  titulo: string;
  descripcion: string;
  icono: 'ventas' | 'inventario' | 'facturacion' | 'compras' | 'contabilidad' | 'rh';
}

@Component({
  providers: [{ provide: LOCALE_ID, useValue: 'es-MX' }],
  imports: [DatePipe, RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  constructor(
    private ventasService: VentasService,
    private contabilidadService: ContabilidadService,
    private inventarioService: InventarioService,
    private rhService: RhService,
    public authService: AuthService,
  ) {
    this.ventasService.cargar();
    this.contabilidadService.cargar();
    this.rhService.cargar();
  }

  hoy = new Date();

  // Variación porcentual contra el periodo anterior; sin dato anterior no se muestra.
  private tendencia(actual: number, anterior: number): string | undefined {
    if (!anterior) return undefined;
    const cambio = ((actual - anterior) / anterior) * 100;
    return `${cambio >= 0 ? '+' : ''}${cambio.toFixed(0)}%`;
  }

  private dinero(valor: number): string {
    return `$${valor.toFixed(2)}`;
  }

  // Los indicadores se calculan con los datos reales cada vez que cambian.
  get estadisticas(): Estadistica[] {
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);
    const inicioAyer = new Date(inicioHoy);
    inicioAyer.setDate(inicioAyer.getDate() - 1);

    const ventas = this.ventasService.ventas();
    const ventasHoy = ventas.filter((v) => v.fecha >= inicioHoy).reduce((s, v) => s + v.total, 0);
    const ventasAyer = ventas.filter((v) => v.fecha >= inicioAyer && v.fecha < inicioHoy).reduce((s, v) => s + v.total, 0);

    const ahora = new Date();
    const ingresosDelMes = (mes: number, anio: number) =>
      this.contabilidadService
        .movimientos()
        .filter((m) => {
          const f = new Date(`${m.fecha}T00:00:00`);
          return m.tipo === 'ingreso' && f.getMonth() === mes && f.getFullYear() === anio;
        })
        .reduce((s, m) => s + m.monto, 0);
    const mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const ingresosMes = ingresosDelMes(ahora.getMonth(), ahora.getFullYear());
    const ingresosMesAnterior = ingresosDelMes(mesAnterior.getMonth(), mesAnterior.getFullYear());

    const productosEnAlerta = this.inventarioService
      .productos()
      .filter((p) => p.estado === 'activo' && this.inventarioService.estado(p) !== 'disponible').length;
    const trabajadoresActivos = this.rhService.trabajadores().filter((t) => t.estado === 'activo').length;

    return [
      { etiqueta: 'Ventas de hoy', valor: this.dinero(ventasHoy), tendencia: this.tendencia(ventasHoy, ventasAyer) },
      { etiqueta: 'Ingresos del mes', valor: this.dinero(ingresosMes), tendencia: this.tendencia(ingresosMes, ingresosMesAnterior) },
      { etiqueta: 'Productos con alerta de existencia', valor: String(productosEnAlerta), alerta: true },
      { etiqueta: 'Trabajadores activos', valor: String(trabajadoresActivos) },
    ];
  }

  modulos: Modulo[] = [
    {
      ruta: '/punto-venta',
      clase: 'ventas',
      icono: 'ventas',
      titulo: 'Punto de Venta',
      descripcion: 'Ventas diarias, selección de productos, pagos y generación de tickets.',
    },
    {
      ruta: '/inventario',
      clase: 'inventario',
      icono: 'inventario',
      titulo: 'Inventario',
      descripcion: 'Productos, cantidades disponibles, entradas, salidas y alertas de existencia.',
    },
    {
      ruta: '/ventas-facturacion',
      clase: 'facturacion',
      icono: 'facturacion',
      titulo: 'Ventas y Facturación',
      descripcion: 'Historial de ventas, pagos, facturas emitidas y estado de cada operación.',
    },
    {
      ruta: '/compras-proveedores',
      clase: 'compras',
      icono: 'compras',
      titulo: 'Compras y Proveedores',
      descripcion: 'Registro de proveedores, órdenes de compra y recepción de mercancía.',
    },
    {
      ruta: '/contabilidad',
      clase: 'contabilidad',
      icono: 'contabilidad',
      titulo: 'Contabilidad y Finanzas',
      descripcion: 'Ingresos, egresos, estadísticas, reportes y exportación a Excel.',
    },
    {
      ruta: '/recursos-humanos',
      clase: 'rh',
      icono: 'rh',
      titulo: 'Recursos Humanos',
      descripcion: 'Trabajadores, puestos, salarios, horarios, asistencias y vacaciones.',
    },
  ];
}
