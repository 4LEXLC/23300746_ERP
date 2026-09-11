// Comprobante de venta y solicitud de factura.
import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CarritoService } from '../../compartidos/servicios/carrito.service';

import { FormularioCliente } from '../../compartidos/modales/formulario-cliente/formulario-cliente';
import { VentasService } from '../../compartidos/servicios/ventas.service';

@Component({
  imports: [RouterLink, DatePipe, FormularioCliente],
  selector: 'app-ticket',
  styleUrl: './ticket.css',
  templateUrl: './ticket.html',
})
export class Ticket {
  constructor(
    public carritoService: CarritoService,
    private ventasService: VentasService,
    private router: Router,
  ) {}

  mostrarFormularioCliente = false;

  // Factura la última venta y prepara un nuevo pedido.
  guardarFacturacion(): void {
    const venta = this.ventasService.ventas.find(
      (venta) => venta.folio === this.carritoService.ultimoFolio,
    );
    if (venta && venta.factura !== 'emitida') {
      this.ventasService.generarFactura(venta);
    }
    this.mostrarFormularioCliente = false;
    this.nuevaVenta();
    void this.router.navigate(['/punto-venta']);
  }

  hoy = new Date();

  // Devuelve el nombre del método de pago.
  get metodoPagoEtiqueta(): string {
    return this.carritoService.metodoPago === 'efectivo' ? 'Efectivo' : 'Tarjeta';
  }

  // Abre la impresión del comprobante.
  imprimir(): void {
    window.print();
  }

  // Vacía el carrito para iniciar otra venta.
  nuevaVenta(): void {
    this.carritoService.vaciar();
  }
}
