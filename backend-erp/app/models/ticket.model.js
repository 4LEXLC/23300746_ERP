class Ticket {
  constructor(id_ticket, id_venta, folio, fecha_emision) {
    this.id_ticket = id_ticket;
    this.id_venta = id_venta;
    this.folio = folio;
    this.fecha_emision = fecha_emision;
  }
}

module.exports = Ticket;
