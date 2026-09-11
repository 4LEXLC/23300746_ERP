// Productos y movimientos de inventario en memoria.
import { Injectable } from '@angular/core';

export interface ProductoInventario {
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

@Injectable({ providedIn: 'root' })
export class InventarioService {
  productos: ProductoInventario[] = [
    { nombre: 'Café americano', sku: 'SKU-0001', categoria: 'Bebidas calientes', precio: 32, descripcion: 'Café de grano recién molido', existencia: 48, minimo: 15, estado: 'activo' },
    { nombre: 'Capuchino', sku: 'SKU-0002', categoria: 'Bebidas calientes', precio: 42, descripcion: 'Espresso con leche vaporizada', existencia: 6, minimo: 15, estado: 'activo' },
    { nombre: 'Latte', sku: 'SKU-0003', categoria: 'Bebidas calientes', precio: 40, descripcion: 'Espresso con leche cremosa', existencia: 22, minimo: 12, estado: 'activo' },
    { nombre: 'Chocolate caliente', sku: 'SKU-0004', categoria: 'Bebidas calientes', precio: 38, descripcion: 'Chocolate con leche entera', existencia: 18, minimo: 10, estado: 'activo' },
    { nombre: 'Té chai', sku: 'SKU-0005', categoria: 'Bebidas calientes', precio: 35, descripcion: 'Infusión especiada con leche', existencia: 14, minimo: 8, estado: 'activo' },
    { nombre: 'Frappé de vainilla', sku: 'SKU-0006', categoria: 'Bebidas frías', precio: 48, descripcion: 'Bebida helada a base de café', existencia: 20, minimo: 10, estado: 'activo' },
    { nombre: 'Frappé de moka', sku: 'SKU-0007', categoria: 'Bebidas frías', precio: 48, descripcion: 'Bebida helada con chocolate', existencia: 16, minimo: 10, estado: 'activo' },
    { nombre: 'Café helado', sku: 'SKU-0008', categoria: 'Bebidas frías', precio: 36, descripcion: 'Café de grano servido con hielo', existencia: 25, minimo: 10, estado: 'activo' },
    { nombre: 'Croissant de mantequilla', sku: 'SKU-0009', categoria: 'Repostería', precio: 28, descripcion: 'Horneado diariamente', existencia: 0, minimo: 8, estado: 'activo' },
    { nombre: 'Pay de queso', sku: 'SKU-0010', categoria: 'Repostería', precio: 45, descripcion: 'Rebanada individual', existencia: 12, minimo: 5, estado: 'activo' },
    { nombre: 'Muffin de arándano', sku: 'SKU-0011', categoria: 'Repostería', precio: 32, descripcion: 'Horneado con arándanos naturales', existencia: 15, minimo: 6, estado: 'activo' },
    { nombre: 'Sándwich de jamón y queso', sku: 'SKU-0012', categoria: 'Alimentos', precio: 55, descripcion: 'Pan artesanal', existencia: 9, minimo: 10, estado: 'activo' },
    { nombre: 'Espresso', sku: 'SKU-0013', categoria: 'Bebidas calientes', precio: 28, descripcion: 'Shot doble de espresso', existencia: 35, minimo: 15, estado: 'activo' },
    { nombre: 'Macchiato', sku: 'SKU-0014', categoria: 'Bebidas calientes', precio: 40, descripcion: 'Espresso marcado con espuma de leche', existencia: 10, minimo: 12, estado: 'activo' },
    { nombre: 'Té helado de limón', sku: 'SKU-0015', categoria: 'Bebidas frías', precio: 30, descripcion: 'Infusión de té negro con limón', existencia: 19, minimo: 8, estado: 'activo' },
    { nombre: 'Limonada de fresa', sku: 'SKU-0016', categoria: 'Bebidas frías', precio: 34, descripcion: 'Limonada natural con fresa', existencia: 8, minimo: 10, estado: 'activo' },
    { nombre: 'Concha', sku: 'SKU-0017', categoria: 'Repostería', precio: 22, descripcion: 'Pan dulce tradicional', existencia: 26, minimo: 10, estado: 'activo' },
    { nombre: 'Brownie', sku: 'SKU-0018', categoria: 'Repostería', precio: 30, descripcion: 'Brownie de chocolate con nuez', existencia: 0, minimo: 6, estado: 'activo' },
    { nombre: 'Bagel con queso crema', sku: 'SKU-0019', categoria: 'Alimentos', precio: 42, descripcion: 'Bagel tostado con queso crema', existencia: 13, minimo: 8, estado: 'activo' },
    { nombre: 'Ensalada de pollo', sku: 'SKU-0020', categoria: 'Alimentos', precio: 65, descripcion: 'Ensalada fresca con pollo a la plancha', existencia: 5, minimo: 6, estado: 'inactivo' },
  ];

  movimientos: MovimientoInventario[] = [
    { producto: 'Café americano', tipo: 'entrada', cantidad: 30, motivo: 'Compra recibida', fecha: new Date() },
    { producto: 'Capuchino', tipo: 'salida', cantidad: 24, motivo: 'Venta registrada', fecha: new Date() },
    { producto: 'Frappé de vainilla', tipo: 'salida', cantidad: 15, motivo: 'Venta registrada', fecha: new Date() },
    { producto: 'Croissant de mantequilla', tipo: 'merma', cantidad: 4, motivo: 'Producto caducado', fecha: new Date() },
    { producto: 'Pay de queso', tipo: 'entrada', cantidad: 12, motivo: 'Compra recibida', fecha: new Date() },
  ];

  // Agrega un producto con un SKU consecutivo.
  agregarProducto(producto: Omit<ProductoInventario, 'sku'>): void {
    const consecutivo = (this.productos.length + 1).toString().padStart(4, '0');
    this.productos.push({ ...producto, sku: `SKU-${consecutivo}` });
  }

  // Actualiza el producto que coincide con el SKU.
  editarProducto(sku: string, cambios: Omit<ProductoInventario, 'sku'>): void {
    this.productos = this.productos.map((p) => (p.sku === sku ? { ...p, ...cambios } : p));
  }

  // Cambia entre activo e inactivo.
  alternarEstado(sku: string): void {
    this.productos = this.productos.map((p) =>
      p.sku === sku ? { ...p, estado: p.estado === 'activo' ? 'inactivo' : 'activo' } : p,
    );
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

  // Descuenta las unidades vendidas y registra la salida.
  registrarVenta(nombre: string, cantidad: number): void {
    const producto = this.productos.find((p) => p.nombre === nombre);
    if (!producto) return;
    producto.existencia = Math.max(0, producto.existencia - cantidad);
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
  }

  // Suma las unidades recibidas y registra sus entradas.
  registrarEntradaPorCompra(items: { nombre: string; cantidad: number }[], proveedor: string): void {
    for (const item of items) {
      const producto = this.productos.find((p) => p.nombre === item.nombre);
      if (producto) {
        producto.existencia += item.cantidad;
      }
      this.movimientos = [
        { producto: item.nombre, tipo: 'entrada', cantidad: item.cantidad, motivo: `Compra recibida de ${proveedor}`, fecha: new Date() },
        ...this.movimientos,
      ];
    }
  }
}
