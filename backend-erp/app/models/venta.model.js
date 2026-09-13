class Venta {
  constructor(id_venta, id_trabajador, fecha, productos, subtotal, iva, total, estado) {
    this.id_venta = id_venta;
    this.id_trabajador = id_trabajador;
    this.fecha = fecha;
    this.productos = productos;
    this.subtotal = subtotal;
    this.iva = iva;
    this.total = total;
    this.estado = estado;
  }
}

module.exports = Venta;
