// Historial de ventas y gestión de facturas.
import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatosCliente, FormularioCliente } from '../compartidos/modales/formulario-cliente/formulario-cliente';
import { Venta, VentasService } from '../compartidos/servicios/ventas.service';

@Component({
  imports: [DatePipe, FormsModule, FormularioCliente],
  selector: 'app-ventas-facturacion',
  styleUrl: './ventas-facturacion.css',
  templateUrl: './ventas-facturacion.html',
})
export class VentasFacturacion {
  constructor(public ventasService: VentasService) {}

  pestanaActiva: 'ventas' | 'facturas' = 'ventas';
  diasPeriodo = 7;
  periodos = [
    { dias: 1, etiqueta: 'Hoy' },
    { dias: 7, etiqueta: 'Últimos 7 días' },
    { dias: 30, etiqueta: 'Últimos 30 días' },
    { dias: 0, etiqueta: 'Todas' },
  ];
  hoy = new Date();

  // Obtiene el historial de ventas.
  get ventas(): Venta[] {
    return this.ventasService.ventas();
  }

  // Ventas dentro del periodo elegido (0 = todas).
  get ventasPeriodo(): Venta[] {
    if (!this.diasPeriodo) return this.ventas;
    const limite = new Date();
    limite.setHours(0, 0, 0, 0);
    limite.setDate(limite.getDate() - (this.diasPeriodo - 1));
    return this.ventas.filter((v) => v.fecha >= limite);
  }

  // Muestra las ventas según la pestaña activa y el periodo.
  get ventasMostradas(): Venta[] {
    return this.pestanaActiva === 'facturas' ? this.ventasPeriodo.filter((v) => v.factura === 'emitida') : this.ventasPeriodo;
  }

  // Obtiene la cantidad de ventas del periodo.
  get totalVentas(): number {
    return this.ventasPeriodo.length;
  }

  // Cuenta las ventas con factura emitida del periodo.
  get totalFacturadas(): number {
    return this.ventasPeriodo.filter((v) => v.factura === 'emitida').length;
  }

  mostrarFormularioCliente = false;
  ventaEnFactura: Venta | null = null;
  ultimaFactura = '';
  subtotalFacturado = 0;
  ivaFacturado = 0;
  totalFacturado = 0;

  // Abre el formulario para facturar la venta elegida.
  facturar(venta: Venta): void {
    this.ventaEnFactura = venta;
    this.mostrarFormularioCliente = true;
  }

  // Genera el folio y actualiza los datos de la factura.
  generarFactura(datos: DatosCliente): void {
    const venta = this.ventaEnFactura;
    if (!venta) return;

    this.ventasService.generarFactura(venta, datos).subscribe((facturada) => {
      this.ultimaFactura = facturada.folioFactura ?? '';
      this.totalFacturado = venta.total;
      this.ivaFacturado = venta.total - venta.total / 1.16;
      this.subtotalFacturado = venta.total - this.ivaFacturado;
    });

    this.ventaEnFactura = null;
    this.mostrarFormularioCliente = false;
  }

  // Retira la factura de la venta.
  cancelarFactura(venta: Venta): void {
    this.ventasService.cancelarFactura(venta);
  }
}
