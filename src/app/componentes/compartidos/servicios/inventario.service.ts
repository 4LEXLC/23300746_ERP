// Productos y movimientos de inventario contra el backend real (tabla producto / movimiento_inventario).
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.config';

export interface ProductoInventario {
  id_producto?: number;
  nombre: string;
  sku: string;
  categoria: string;
  precio: number;
  descripcion: string;
  existencia: number;
  minimo: number;
  estado: 'activo' | 'inactivo';
}

export interface MovimientoInventario {
  producto: string;
  tipo: 'entrada' | 'salida' | 'merma';
  cantidad: number;
  motivo: string;
  fecha: Date;
}

interface ProductoBackend {
  id_producto: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio_venta: string | number;
  stock: number;
  stock_minimo: number;
  imagen: string | null;
  fecha_modificacion: string;
  activo: number | boolean;
}

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly apiUrl = `${API_URL}/producto`;

  productos: ProductoInventario[] = [];

  movimientos: MovimientoInventario[] = [];

  constructor(private http: HttpClient) {
    this.cargarProductos();
  }

  private cargarProductos(): void {
    this.http.get<ProductoBackend[]>(this.apiUrl).subscribe((datos) => {
      this.productos = datos.map((p) => this.aFrontend(p));
    });
  }

  private aFrontend(p: ProductoBackend): ProductoInventario {
    return {
      id_producto: p.id_producto,
      nombre: p.nombre,
      sku: `SKU-${String(p.id_producto).padStart(4, '0')}`,
      categoria: p.categoria,
      precio: Number(p.precio_venta),
      descripcion: p.descripcion,
      existencia: p.stock,
      minimo: p.stock_minimo,
      estado: (p.activo === true || p.activo === 1) ? 'activo' : 'inactivo',
    };
  }

  private aBackend(producto: Omit<ProductoInventario, 'sku'>) {
    return {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      precio_venta: producto.precio,
      stock: producto.existencia,
      stock_minimo: producto.minimo,
      imagen: null,
      activo: producto.estado === 'activo',
    };
  }

  // Agrega un producto en el backend y lo refleja en la lista local.
  agregarProducto(producto: Omit<ProductoInventario, 'sku'>): void {
    this.http.post<ProductoBackend>(this.apiUrl, this.aBackend(producto)).subscribe((creado) => {
      this.productos = [...this.productos, this.aFrontend(creado)];
    });
  }

  // Actualiza el producto que coincide con el SKU.
  editarProducto(sku: string, cambios: Omit<ProductoInventario, 'sku'>): void {
    const actual = this.productos.find((p) => p.sku === sku);
    if (!actual?.id_producto) return;
    this.http.put<ProductoBackend>(`${this.apiUrl}/${actual.id_producto}`, this.aBackend(cambios)).subscribe((actualizado) => {
      this.productos = this.productos.map((p) => (p.sku === sku ? this.aFrontend(actualizado) : p));
    });
  }

  // Cambia entre activo e inactivo.
  alternarEstado(sku: string): void {
    const actual = this.productos.find((p) => p.sku === sku);
    if (!actual) return;
    this.editarProducto(sku, { ...actual, estado: actual.estado === 'activo' ? 'inactivo' : 'activo' });
  }

  // Comprueba si alcanza la cantidad disponible.
  verificarExistencia(nombre: string, cantidad: number): boolean {
    return this.existenciaDe(nombre) >= cantidad;
  }

  // Obtiene el nivel de disponibilidad del producto.
  estado(producto: ProductoInventario): 'agotado' | 'alerta' | 'disponible' {
    if (producto.existencia <= 0) return 'agotado';
    if (producto.existencia <= producto.minimo) return 'alerta';
    return 'disponible';
  }

  // Consulta las unidades disponibles.
  existenciaDe(nombre: string): number {
    return this.productos.find((p) => p.nombre === nombre)?.existencia ?? 0;
  }

  // Descuenta las unidades vendidas, actualiza el backend y registra la salida.
  registrarVenta(nombre: string, cantidad: number): void {
    const producto = this.productos.find((p) => p.nombre === nombre);
    if (!producto) return;
    producto.existencia = Math.max(0, producto.existencia - cantidad);
    this.persistirMovimiento(producto, 'salida', cantidad, 'Venta registrada');
    this.movimientos = [
      { producto: nombre, tipo: 'salida', cantidad, motivo: 'Venta registrada', fecha: new Date() },
      ...this.movimientos,
    ];
  }

  // Devuelve al inventario las unidades reservadas.
  liberarReserva(nombre: string, cantidad: number): void {
    const producto = this.productos.find((p) => p.nombre === nombre);
    if (!producto) return;
    producto.existencia += cantidad;
    this.persistirStock(producto);
  }

  // Suma las unidades recibidas, actualiza el backend y registra sus entradas.
  registrarEntradaPorCompra(items: { nombre: string; cantidad: number }[], proveedor: string): void {
    for (const item of items) {
      const producto = this.productos.find((p) => p.nombre === item.nombre);
      if (producto) {
        producto.existencia += item.cantidad;
        this.persistirMovimiento(producto, 'entrada', item.cantidad, `Compra recibida de ${proveedor}`);
      }
      this.movimientos = [
        { producto: item.nombre, tipo: 'entrada', cantidad: item.cantidad, motivo: `Compra recibida de ${proveedor}`, fecha: new Date() },
        ...this.movimientos,
      ];
    }
  }

  private persistirStock(producto: ProductoInventario): void {
    if (!producto.id_producto) return;
    this.http.put(`${this.apiUrl}/${producto.id_producto}`, this.aBackend(producto)).subscribe();
  }

  private persistirMovimiento(producto: ProductoInventario, tipo: 'entrada' | 'salida' | 'merma', cantidad: number, motivo: string): void {
    if (!producto.id_producto) return;
    this.persistirStock(producto);
    this.http.post(`${API_URL}/movimiento_inventario`, { id_producto: producto.id_producto, tipo, cantidad, motivo }).subscribe();
  }
}
