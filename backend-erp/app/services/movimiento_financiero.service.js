// CRUD de movimiento_financiero: ingresos (ventas) y egresos (compras) para contabilidad.
const conexion = require('../../config/db');
const MovimientoFinanciero = require('../models/movimiento_financiero.model');

const COLUMNAS = 'id_movimiento_financiero, id_venta, id_compra, tipo, concepto, monto, fecha';

function mapFila(fila) {
  return new MovimientoFinanciero(fila.id_movimiento_financiero, fila.id_venta, fila.id_compra, fila.tipo, fila.concepto, fila.monto, fila.fecha);
}

async function obtenerMovimientoFinancieros() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM movimiento_financiero ORDER BY fecha DESC`);
  return filas.map(mapFila);
}

async function obtenerMovimientoFinancieroPorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM movimiento_financiero WHERE id_movimiento_financiero = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearMovimientoFinanciero(datos) {
  const [resultado] = await conexion.promise().query(
    'INSERT INTO movimiento_financiero (id_venta, id_compra, tipo, concepto, monto) VALUES (?, ?, ?, ?, ?)',
    [datos.id_venta ?? null, datos.id_compra ?? null, datos.tipo, datos.concepto, datos.monto]
  );
  return obtenerMovimientoFinancieroPorId(resultado.insertId);
}

async function actualizarMovimientoFinanciero(id, datos) {
  await conexion.promise().query(
    'UPDATE movimiento_financiero SET id_venta = ?, id_compra = ?, tipo = ?, concepto = ?, monto = ? WHERE id_movimiento_financiero = ?',
    [datos.id_venta ?? null, datos.id_compra ?? null, datos.tipo, datos.concepto, datos.monto, id]
  );
  return obtenerMovimientoFinancieroPorId(id);
}

async function eliminarMovimientoFinanciero(id) {
  await conexion.promise().query('DELETE FROM movimiento_financiero WHERE id_movimiento_financiero = ?', [id]);
}

module.exports = {
  obtenerMovimientoFinancieros,
  obtenerMovimientoFinancieroPorId,
  crearMovimientoFinanciero,
  actualizarMovimientoFinanciero,
  eliminarMovimientoFinanciero,
};
