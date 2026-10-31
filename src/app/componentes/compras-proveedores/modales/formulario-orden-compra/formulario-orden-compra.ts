// Captura de productos y cantidades de una compra.
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../compartidos/servicios/inventario.service';
import { ComprasService, LineaOrdenCompra } from '../../../compartidos/servicios/compras.service';

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
  constructor(
    private inventarioService: InventarioService,
    private comprasService: ComprasService,
  ) {}

  error = '';

  // Recibe datos del componente padre o le comunica acciones.
  @Input() proveedores: string[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<DatosOrdenCompra>();

  proveedorSeleccionado = '';
  fecha = '';
  items: LineaOrdenCompra[] = [];

  // Consulta el catálogo para la orden de compra.
  get productosDisponibles() {
    return this.inventarioService.productos();
  }

  productoSeleccionado = '';
  nuevaCantidad = 1;
  nuevoPrecio = 0;

  // Usa el último precio con ese proveedor; si no hay, propone el 60 % del precio de venta.
  seleccionarProducto(nombre: string): void {
    this.productoSeleccionado = nombre;
    const producto = this.productosDisponibles.find((p) => p.nombre === nombre);
    const ultimoPrecio = this.comprasService.precioDe(this.proveedorSeleccionado, producto?.id_producto);
    this.nuevoPrecio = ultimoPrecio ?? (producto ? Math.round(producto.precio * 0.6 * 100) / 100 : 0);
  }

  get total(): number {
    return this.items.reduce((suma, item) => suma + item.cantidad * item.precioUnitario, 0);
  }

  // Cantidad y precio mayores que cero.
  agregarItem(): void {
    const producto = this.productosDisponibles.find((p) => p.nombre === this.productoSeleccionado);
    if (!producto) { this.error = 'Selecciona un producto.'; return; }
    if (!(this.nuevaCantidad > 0)) { this.error = 'La cantidad debe ser mayor que cero.'; return; }
    if (!(this.nuevoPrecio > 0)) { this.error = 'El precio de compra debe ser mayor que cero.'; return; }
    this.error = '';
    this.items.push({ id_producto: producto.id_producto, nombre: producto.nombre, cantidad: this.nuevaCantidad, precioUnitario: this.nuevoPrecio });
    this.productoSeleccionado = '';
    this.nuevaCantidad = 1;
    this.nuevoPrecio = 0;
  }

  quitarItem(index: number): void {
    this.items.splice(index, 1);
  }

  // Al menos un producto.
  onGuardar(): void {
    if (!this.items.length) { this.error = 'Agrega al menos un producto a la orden.'; return; }
    this.error = '';
    this.guardar.emit({ proveedor: this.proveedorSeleccionado, fecha: this.fecha, items: this.items, estado: 'pendiente' });
  }
}
