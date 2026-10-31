// CRUD de pago: pago asociado a cada venta.
const conexion = require('../../config/db');
const Pago = require('../models/pago.model');

const COLUMNAS = 'id_pago, id_venta, metodo_pago, referencia_transaccion, monto, estado, fecha';

function mapFila(fila) {
  return new Pago(fila.id_pago, fila.id_venta, fila.metodo_pago, fila.referencia_transaccion, fila.monto, fila.estado, fila.fecha);
}

async function obtenerPagos() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM pago`);
  return filas.map(mapFila);
}

async function obtenerPagoPorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM pago WHERE id_pago = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearPago(datos) {
  const [resultado] = await conexion.promise().query(
    'INSERT INTO pago (id_venta, metodo_pago, referencia_transaccion, monto, estado) VALUES (?, ?, ?, ?, ?)',
    [datos.id_venta, datos.metodo_pago, datos.referencia_transaccion, datos.monto, datos.estado]
  );
  return obtenerPagoPorId(resultado.insertId);
}

async function actualizarPago(id, datos) {
  await conexion.promise().query(
    'UPDATE pago SET id_venta = ?, metodo_pago = ?, referencia_transaccion = ?, monto = ?, estado = ? WHERE id_pago = ?',
    [datos.id_venta, datos.metodo_pago, datos.referencia_transaccion, datos.monto, datos.estado, id]
  );
  return obtenerPagoPorId(id);
}

async function eliminarPago(id) {
  await conexion.promise().query('DELETE FROM pago WHERE id_pago = ?', [id]);
}

// Total de la venta, para compararlo con el monto del pago.
async function totalDeVenta(idVenta) {
  const [filas] = await conexion.promise().query('SELECT total FROM venta WHERE id_venta = ?', [idVenta]);
  return filas.length ? Number(filas[0].total) : null;
}

// Una referencia de transacción no se puede usar dos veces.
async function referenciaUsada(referencia) {
  const [filas] = await conexion.promise().query('SELECT 1 FROM pago WHERE referencia_transaccion = ?', [referencia]);
  return filas.length > 0;
}

// Una venta solo puede tener un pago.
async function ventaTienePago(idVenta) {
  const [filas] = await conexion.promise().query('SELECT 1 FROM pago WHERE id_venta = ?', [idVenta]);
  return filas.length > 0;
}

// La venta pasa de pendiente a completada solo cuando su pago ya quedó guardado.
async function completarVenta(idVenta) {
  await conexion.promise().query("UPDATE venta SET estado = 'completada' WHERE id_venta = ?", [idVenta]);
}

module.exports = {
  obtenerPagos,
  obtenerPagoPorId,
  crearPago,
  actualizarPago,
  eliminarPago,
  totalDeVenta,
  referenciaUsada,
  ventaTienePago,
  completarVenta,
};
