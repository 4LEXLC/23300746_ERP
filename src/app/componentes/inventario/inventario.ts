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

  get productos(): ProductoInventario[] {
    return this.inventarioService.productos;
  }

  get movimientos() {
    return this.inventarioService.movimientos;
  }

  get categorias(): string[] {
    return [...new Set(this.productos.map((p) => p.categoria))];
  }

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

  abrirNuevoProducto(): void {
    this.productoEnEdicion = null;
    this.mostrarFormularioProducto = true;
  }

  editarProducto(producto: ProductoInventario): void {
    this.productoEnEdicion = producto;
    this.mostrarFormularioProducto = true;
  }

  alternarEstadoProducto(producto: ProductoInventario): void {
    this.inventarioService.alternarEstado(producto.sku);
  }

  guardarProducto(datos: DatosProducto): void {
    if (this.productoEnEdicion) {
      this.inventarioService.editarProducto(this.productoEnEdicion.sku, datos);
    } else {
      this.inventarioService.agregarProducto(datos);
    }
    this.productoEnEdicion = null;
    this.mostrarFormularioProducto = false;
  }

  get totalProductos(): number {
    return this.productos.length;
  }

  get productosConAlerta(): number {
    return this.productos.filter((p) => p.existencia <= p.minimo).length;
  }

  estado(producto: ProductoInventario): 'agotado' | 'alerta' | 'disponible' {
    return this.inventarioService.estado(producto);
  }

  porcentajeExistencia(producto: ProductoInventario): number {
    if (producto.minimo <= 0) return producto.existencia > 0 ? 100 : 0;
    return Math.min(100, Math.round((producto.existencia / (producto.minimo * 2)) * 100));
  }
}
