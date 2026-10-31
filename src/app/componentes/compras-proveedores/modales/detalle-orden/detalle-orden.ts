// Detalle de una orden de compra: proveedor, productos, precios y total.
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrdenCompra } from '../../../compartidos/servicios/compras.service';

@Component({
  selector: 'app-detalle-orden',
  imports: [DatePipe],
  templateUrl: './detalle-orden.html',
  styleUrl: './detalle-orden.css',
})
export class DetalleOrden {
  @Input({ required: true }) orden!: OrdenCompra;
  @Output() cerrar = new EventEmitter<void>();
}
