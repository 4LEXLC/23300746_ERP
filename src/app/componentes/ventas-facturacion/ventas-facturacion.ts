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

  get ventas(): Venta[] {
    return this.ventasService.ventas;
  }

  get ventasMostradas(): Venta[] {
    return this.pestanaActiva === 'facturas' ? this.ventas.filter((v) => v.factura === 'emitida') : this.ventas;
  }

  get totalVentas(): number {
    return this.ventasService.totalVentas;
  }

  get totalFacturadas(): number {
    return this.ventasService.totalFacturadas;
  }

  mostrarFormularioCliente = false;
  ventaEnFactura: Venta | null = null;
  ultimaFactura = '';
  subtotalFacturado = 0;
  ivaFacturado = 0;
  totalFacturado = 0;

  facturar(venta: Venta): void {
    this.ventaEnFactura = venta;
    this.mostrarFormularioCliente = true;
  }

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

  cancelarFactura(venta: Venta): void {
    this.ventasService.cancelarFactura(venta);
  }
}
