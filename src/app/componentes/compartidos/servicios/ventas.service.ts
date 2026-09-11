// Ventas y folios de facturas en memoria.
import { Injectable } from '@angular/core';

export interface Venta {
  folio: string;
  fecha: Date;
  productos: number;
  total: number;
  metodoPago: string;
  factura: 'emitida' | 'pendiente' | 'sin-facturar';
  folioFactura?: string;
}

@Injectable({ providedIn: 'root' })
export class VentasService {
  ventas: Venta[] = [
    { folio: 'V-1042', fecha: new Date('2026-09-05T10:15:00'), productos: 3, total: 156, metodoPago: 'Tarjeta', factura: 'sin-facturar' },
    { folio: 'V-1041', fecha: new Date('2026-09-05T09:40:00'), productos: 2, total: 87, metodoPago: 'Efectivo', factura: 'pendiente' },
    { folio: 'V-1040', fecha: new Date('2026-09-04T18:20:00'), productos: 5, total: 243, metodoPago: 'Tarjeta', factura: 'sin-facturar' },
  ];

  // Obtiene la cantidad de ventas registradas.
  get totalVentas(): number {
    return this.ventas.length;
  }

  // Cuenta las ventas con factura emitida.
  get totalFacturadas(): number {
    return this.ventas.filter((v) => v.factura === 'emitida').length;
  }

  // Crea la venta con folio y estado de facturación.
  registrarVenta(productos: number, total: number, metodoPago: string, solicitaFactura: boolean): Venta {
    const consecutivo = 1042 + this.ventas.length;
    const venta: Venta = {
      folio: `V-${consecutivo}`,
      fecha: new Date(),
      productos,
      total,
      metodoPago,
      factura: solicitaFactura ? 'pendiente' : 'sin-facturar',
    };
    this.ventas = [venta, ...this.ventas];
    return venta;
  }

  // Genera el folio y actualiza los datos de la factura.
  generarFactura(venta: Venta): string {
    const consecutivo = (this.totalFacturadas + 1).toString().padStart(4, '0');
    venta.factura = 'emitida';
    venta.folioFactura = `FAC-${consecutivo}`;
    return venta.folioFactura;
  }

  // Retira la factura de la venta.
  cancelarFactura(venta: Venta): void {
    venta.factura = 'sin-facturar';
    venta.folioFactura = undefined;
  }
}
