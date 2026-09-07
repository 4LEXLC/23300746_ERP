import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Producto {
  nombre: string;
  categoria: string;
  precio: number;
  icono: 'bebida' | 'reposteria';
}

@Component({
  selector: 'app-producto-card',
  imports: [],
  templateUrl: './producto-card.html',
  styleUrl: './producto-card.css',
})
export class ProductoCard {
  @Input({ required: true }) producto!: Producto;
  @Input() cantidadEnCarrito = 0;
  @Input() sinExistencia = false;
  @Output() agregar = new EventEmitter<void>();
}
