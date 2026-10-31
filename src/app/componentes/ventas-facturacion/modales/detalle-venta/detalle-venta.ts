// Detalle de una venta: productos, pago y factura.
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Venta } from '../../../compartidos/servicios/ventas.service';

@Component({
  selector: 'app-detalle-venta',
  imports: [DatePipe],
  templateUrl: './detalle-venta.html',
  styleUrl: './detalle-venta.css',
})
export class DetalleVenta {
  @Input({ required: true }) venta!: Venta;
  @Output() cerrar = new EventEmitter<void>();
}
