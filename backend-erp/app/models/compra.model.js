class Compra {
  constructor(id_compra, id_proveedor, fecha, productos, total, estado) {
    this.id_compra = id_compra;
    this.id_proveedor = id_proveedor;
    this.fecha = fecha;
    this.productos = productos;
    this.total = total;
    this.estado = estado;
  }
}

module.exports = Compra;
