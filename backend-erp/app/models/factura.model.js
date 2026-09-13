class Factura {
  constructor(id_factura, id_venta, id_cliente, folio, fecha_emision, estado) {
    this.id_factura = id_factura;
    this.id_venta = id_venta;
    this.id_cliente = id_cliente;
    this.folio = folio;
    this.fecha_emision = fecha_emision;
    this.estado = estado;
  }
}

module.exports = Factura;
