class ProductoProveedor {
  constructor(id_producto_proveedor, id_producto, id_proveedor, precio_compra) {
    this.id_producto_proveedor = id_producto_proveedor;
    this.id_producto = id_producto;
    this.id_proveedor = id_proveedor;
    this.precio_compra = precio_compra;
  }
}

module.exports = ProductoProveedor;
