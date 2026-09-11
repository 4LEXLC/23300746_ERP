// Producto del carrito y controles de cantidad.
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Producto } from '../producto-card/producto-card';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-carrito-item',
  imports: [],
  templateUrl: './carrito-item.html',
  styleUrl: './carrito-item.css',
})
export class CarritoItem {
  // Recibe datos del componente padre o le comunica acciones.
  @Input({ required: true }) item!: ItemCarrito;
  @Output() incrementar = new EventEmitter<void>();
  @Output() decrementar = new EventEmitter<void>();

  // Calcula el importe total.
  get total(): number {
    return this.item.producto.precio * this.item.cantidad;
  }
}
