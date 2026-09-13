class MovimientoInventario {
  constructor(id_movimiento, id_producto, tipo, cantidad, fecha, motivo) {
    this.id_movimiento = id_movimiento;
    this.id_producto = id_producto;
    this.tipo = tipo;
    this.cantidad = cantidad;
    this.fecha = fecha;
    this.motivo = motivo;
  }
}

module.exports = MovimientoInventario;
