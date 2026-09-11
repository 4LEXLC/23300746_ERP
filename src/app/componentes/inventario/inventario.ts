// Consulta y administración de productos.
import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatosProducto, FormularioProducto } from './modales/formulario-producto/formulario-producto';
import { InventarioService, ProductoInventario } from '../compartidos/servicios/inventario.service';

@Component({
  imports: [DatePipe, FormsModule, FormularioProducto],
  selector: 'app-inventario',
  styleUrl: './inventario.css',
  templateUrl: './inventario.html',
})
export class Inventario {
  constructor(public inventarioService: InventarioService) {}

  mostrarFormularioProducto = false;
  productoEnEdicion: ProductoInventario | null = null;
  busqueda = '';
  categoriaFiltro = '';
  estadoFiltro = '';

  // Obtiene los productos que utiliza esta pantalla.
  get productos(): ProductoInventario[] {
    return this.inventarioService.productos;
  }

  // Obtiene el historial de movimientos.
  get movimientos() {
    return this.inventarioService.movimientos;
  }

  // Obtiene las categorías sin repetirlas.
  get categorias(): string[] {
    return [...new Set(this.productos.map((p) => p.categoria))];
  }

  // Filtra los productos según los controles de búsqueda.
  get productosFiltrados(): ProductoInventario[] {
    const termino = this.busqueda.trim().toLowerCase();
    return this.productos.filter((p) => {
      const coincideTermino =
        !termino || p.nombre.toLowerCase().includes(termino) || p.sku.toLowerCase().includes(termino);
      const coincideCategoria = !this.categoriaFiltro || p.categoria === this.categoriaFiltro;
      const coincideEstado =
        !this.estadoFiltro ||
        (this.estadoFiltro === 'inactivo' ? p.estado === 'inactivo' : p.estado === 'activo' && this.estado(p) === this.estadoFiltro);
      return coincideTermino && coincideCategoria && coincideEstado;
    });
  }

  // Abre el formulario vacío para crear un producto.
  abrirNuevoProducto(): void {
    this.productoEnEdicion = null;
    this.mostrarFormularioProducto = true;
  }

  // Abre el formulario con el producto elegido.
  editarProducto(producto: ProductoInventario): void {
    this.productoEnEdicion = producto;
    this.mostrarFormularioProducto = true;
  }

  // Activa o desactiva el producto.
  alternarEstadoProducto(producto: ProductoInventario): void {
    this.inventarioService.alternarEstado(producto.sku);
  }

  // Crea o actualiza el producto y cierra el formulario.
  guardarProducto(datos: DatosProducto): void {
    if (this.productoEnEdicion) {
      this.inventarioService.editarProducto(this.productoEnEdicion.sku, datos);
    } else {
      this.inventarioService.agregarProducto(datos);
    }
    this.productoEnEdicion = null;
    this.mostrarFormularioProducto = false;
  }

  // Cuenta los productos registrados.
  get totalProductos(): number {
    return this.productos.length;
  }

  // Cuenta los productos que alcanzaron su mínimo.
  get productosConAlerta(): number {
    return this.productos.filter((p) => p.existencia <= p.minimo).length;
  }

  // Obtiene el nivel de disponibilidad del producto.
  estado(producto: ProductoInventario): 'agotado' | 'alerta' | 'disponible' {
    return this.inventarioService.estado(producto);
  }

  // Calcula la barra de existencia respecto al doble del mínimo.
  porcentajeExistencia(producto: ProductoInventario): number {
    if (producto.minimo <= 0) return producto.existencia > 0 ? 100 : 0;
    return Math.min(100, Math.round((producto.existencia / (producto.minimo * 2)) * 100));
  }
}
