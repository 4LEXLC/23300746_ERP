// Historial de ventas y gestión de facturas.
import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DatosCliente, FormularioCliente } from '../compartidos/modales/formulario-cliente/formulario-cliente';
import { Venta, VentasService } from '../compartidos/servicios/ventas.service';

@Component({
  imports: [DatePipe, FormularioCliente],
  selector: 'app-ventas-facturacion',
  styleUrl: './ventas-facturacion.css',
  templateUrl: './ventas-facturacion.html',
})
export class VentasFacturacion {
  constructor(public ventasService: VentasService) {}

  pestanaActiva: 'ventas' | 'facturas' = 'ventas';
  hoy = new Date();

  // Obtiene el historial de ventas.
  get ventas(): Venta[] {
    return this.ventasService.ventas;
  }

  // Muestra las ventas según la pestaña activa.
  get ventasMostradas(): Venta[] {
    return this.pestanaActiva === 'facturas' ? this.ventas.filter((v) => v.factura === 'emitida') : this.ventas;
  }

  // Obtiene la cantidad de ventas registradas.
  get totalVentas(): number {
    return this.ventasService.totalVentas;
  }

  // Cuenta las ventas con factura emitida.
  get totalFacturadas(): number {
    return this.ventasService.totalFacturadas;
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

    const folio = this.ventasService.generarFactura(venta);

    this.ultimaFactura = folio;
    this.totalFacturado = venta.total;
    this.ivaFacturado = venta.total - venta.total / 1.16;
    this.subtotalFacturado = venta.total - this.ivaFacturado;

    this.ventaEnFactura = null;
    this.mostrarFormularioCliente = false;
  }

  // Retira la factura de la venta.
  cancelarFactura(venta: Venta): void {
    this.ventasService.cancelarFactura(venta);
  }
}
