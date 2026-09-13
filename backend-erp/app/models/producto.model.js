class Producto {
  constructor(id_producto, nombre, descripcion, categoria, precio_venta, stock, stock_minimo, imagen, fecha_modificacion, activo) {
    this.id_producto = id_producto;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.categoria = categoria;
    this.precio_venta = precio_venta;
    this.stock = stock;
    this.stock_minimo = stock_minimo;
    this.imagen = imagen;
    this.fecha_modificacion = fecha_modificacion;
    this.activo = activo;
  }
}

module.exports = Producto;
