// Selección del método y simulación del pago.
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoService, MetodoPago } from '../../compartidos/servicios/carrito.service';

@Component({
  imports: [],
  selector: 'app-pago',
  styleUrl: './pago.css',
  templateUrl: './pago.html',
})
export class Pago {
  constructor(public carritoService: CarritoService, private router: Router) {
    if (!this.carritoService.ventaConfirmada) {
      this.router.navigateByUrl('/punto-venta');
    }
  }

  metodos: MetodoPago[] = [
    { id: 'efectivo', etiqueta: 'Efectivo' },
    { id: 'tarjeta', etiqueta: 'Tarjeta' },
  ];

  procesandoPago = false;

  // Actualiza el método de pago elegido.
  seleccionarMetodo(id: MetodoPago['id']): void {
    this.carritoService.metodoPago = id;
  }

  // Libera la reserva y vuelve al pedido.
  volverAlPedido(): void {
    this.carritoService.cancelarConfirmacion();
    this.router.navigateByUrl('/punto-venta');
  }

  // Simula el pago y continúa al comprobante.
  procesarPago(): void {
    if (this.procesandoPago) return;
    this.procesandoPago = true;

    setTimeout(() => {
      this.carritoService.procesarPago();
      this.procesandoPago = false;
      this.router.navigateByUrl('/ticket');
    }, 900);
  }
}
