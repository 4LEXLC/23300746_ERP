import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../compartidos/servicios/inventario.service';

export interface LineaOrdenCompra {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface DatosOrdenCompra {
  proveedor: string;
  fecha: string;
  items: LineaOrdenCompra[];
  estado: 'pendiente' | 'recibida';
}

@Component({
  selector: 'app-formulario-orden-compra',
  imports: [FormsModule],
  templateUrl: './formulario-orden-compra.html',
  styleUrl: './formulario-orden-compra.css',
})
export class FormularioOrdenCompra {
  constructor(private inventarioService: InventarioService) {}

  @Input() proveedores: string[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<DatosOrdenCompra>();

  proveedorSeleccionado = '';
  fecha = '';
  items: LineaOrdenCompra[] = [];

  get productosDisponibles() {
    return this.inventarioService.productos;
  }

  productoSeleccionado = '';
  nuevaCantidad = 1;
  nuevoPrecio = 0;

  seleccionarProducto(nombre: string): void {
    this.productoSeleccionado = nombre;
    const producto = this.productosDisponibles.find((p) => p.nombre === nombre);
    this.nuevoPrecio = producto ? Math.round(producto.precio * 0.6 * 100) / 100 : 0;
  }

  get total(): number {
    return this.items.reduce((suma, item) => suma + item.cantidad * item.precioUnitario, 0);
  }

  agregarItem(): void {
    if (!this.productoSeleccionado || this.nuevaCantidad <= 0) return;
    this.items.push({
      nombre: this.productoSeleccionado,
      cantidad: this.nuevaCantidad,
      precioUnitario: this.nuevoPrecio,
    });
    this.productoSeleccionado = '';
    this.nuevaCantidad = 1;
    this.nuevoPrecio = 0;
  }

  quitarItem(index: number): void {
    this.items.splice(index, 1);
  }

  onGuardar(): void {
    this.guardar.emit({
      proveedor: this.proveedorSeleccionado,
      fecha: this.fecha,
      items: this.items,
      estado: 'pendiente',
    });
  }
}
