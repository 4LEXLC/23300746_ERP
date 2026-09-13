class Pago {
  constructor(id_pago, id_venta, metodo_pago, referencia_transaccion, monto, estado, fecha) {
    this.id_pago = id_pago;
    this.id_venta = id_venta;
    this.metodo_pago = metodo_pago;
    this.referencia_transaccion = referencia_transaccion;
    this.monto = monto;
    this.estado = estado;
    this.fecha = fecha;
  }
}

module.exports = Pago;
