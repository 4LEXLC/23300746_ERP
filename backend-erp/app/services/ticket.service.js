const conexion = require('../../config/db');
const Ticket = require('../models/ticket.model');

const COLUMNAS = 'id_ticket, id_venta, folio, fecha_emision';

function mapFila(fila) {
  return new Ticket(fila.id_ticket, fila.id_venta, fila.folio, fila.fecha_emision);
}

async function obtenerTickets() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM ticket`);
  return filas.map(mapFila);
}

async function obtenerTicketPorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM ticket WHERE id_ticket = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearTicket(datos) {
  const [resultado] = await conexion.promise().query(
    'INSERT INTO ticket (id_venta, folio) VALUES (?, ?)',
    [datos.id_venta, datos.folio]
  );
  return obtenerTicketPorId(resultado.insertId);
}

async function actualizarTicket(id, datos) {
  await conexion.promise().query(
    'UPDATE ticket SET id_venta = ?, folio = ? WHERE id_ticket = ?',
    [datos.id_venta, datos.folio, id]
  );
  return obtenerTicketPorId(id);
}

async function eliminarTicket(id) {
  await conexion.promise().query('DELETE FROM ticket WHERE id_ticket = ?', [id]);
}

module.exports = {
  obtenerTickets,
  obtenerTicketPorId,
  crearTicket,
  actualizarTicket,
  eliminarTicket,
};
