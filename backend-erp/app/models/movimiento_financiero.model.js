class MovimientoFinanciero {
  constructor(id_movimiento_financiero, id_venta, id_compra, tipo, concepto, monto, fecha) {
    this.id_movimiento_financiero = id_movimiento_financiero;
    this.id_venta = id_venta;
    this.id_compra = id_compra;
    this.tipo = tipo;
    this.concepto = concepto;
    this.monto = monto;
    this.fecha = fecha;
  }
}

module.exports = MovimientoFinanciero;
