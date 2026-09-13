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

module.exports = {
  obtenerPagos,
  obtenerPagoPorId,
  crearPago,
  actualizarPago,
  eliminarPago,
};
