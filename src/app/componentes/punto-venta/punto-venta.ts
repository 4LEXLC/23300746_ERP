import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Producto, ProductoCard } from './componentes/producto-card/producto-card';
import { CarritoItem } from './componentes/carrito-item/carrito-item';
import { CarritoService } from '../compartidos/servicios/carrito.service';
import { InventarioService } from '../compartidos/servicios/inventario.service';
import { AuthService } from '../compartidos/servicios/auth.service';
import { Sidebar } from '../compartidos/componentes/sidebar/sidebar';

@Component({
  imports: [ProductoCard, CarritoItem, FormsModule, Sidebar],
  selector: 'app-punto-venta',
  styleUrl: './punto-venta.css',
  templateUrl: './punto-venta.html',
})
export class PuntoVenta {
  constructor(
    public carritoService: CarritoService,
    private inventarioService: InventarioService,
    private router: Router,
    public authService: AuthService,
  ) {}

  errorConfirmacion = '';

  categoriaActiva = 'Todos';
  busqueda = '';

  get categorias(): string[] {
    return ['Todos', ...new Set(this.inventarioService.productos.map((p) => p.categoria))];
  }

  get productos(): Producto[] {
    return this.inventarioService.productos
      .filter((p) => p.estado === 'activo')
      .map((p) => ({
        nombre: p.nombre,
        categoria: p.categoria,
        precio: p.precio,
        icono: p.categoria === 'Repostería' || p.categoria === 'Alimentos' ? 'reposteria' : 'bebida',
      }));
  }

  get productosFiltrados(): Producto[] {
    let lista = this.productos;
    if (this.categoriaActiva !== 'Todos') {
      lista = lista.filter((p) => p.categoria === this.categoriaActiva);
    }
    const termino = this.busqueda.trim().toLowerCase();
    if (termino) {
      lista = lista.filter((p) => p.nombre.toLowerCase().includes(termino));
    }
    return lista;
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaActiva = categoria;
  }

  existenciaDe(producto: Producto): number {
    return this.inventarioService.existenciaDe(producto.nombre);
  }

  cantidadEnCarrito(producto: Producto): number {
    return this.carritoService.cantidadDe(producto);
  }

  agregarAlCarrito(producto: Producto): void {
    if (this.existenciaDe(producto) <= this.cantidadEnCarrito(producto)) return;
    this.carritoService.agregar(producto);
  }

  confirmarVenta(): void {
    const exito = this.carritoService.confirmarVenta();
    if (!exito) {
      this.errorConfirmacion = 'No hay existencia suficiente de uno o más productos del pedido.';
      return;
    }
    this.errorConfirmacion = '';
    this.router.navigateByUrl('/pago');
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigateByUrl('/login');
  }
}
