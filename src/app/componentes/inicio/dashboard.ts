import { Component, LOCALE_ID } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
import { RouterLink } from '@angular/router';

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
  hoy = new Date();

  estadisticas: Estadistica[] = [
    { etiqueta: 'Ventas de hoy', valor: '$0.00', tendencia: '0%' },
    { etiqueta: 'Ingresos del mes', valor: '$0.00', tendencia: '0%' },
    { etiqueta: 'Productos con alerta de existencia', valor: '0', alerta: true },
    { etiqueta: 'Trabajadores activos', valor: '0' },
  ];

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
