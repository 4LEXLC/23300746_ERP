// CRUD de movimiento_inventario: entradas y salidas de stock de cada producto.
const conexion = require('../../config/db');
const MovimientoInventario = require('../models/movimiento_inventario.model');

const COLUMNAS = 'id_movimiento, id_producto, tipo, cantidad, fecha, motivo';

function mapFila(fila) {
  return new MovimientoInventario(fila.id_movimiento, fila.id_producto, fila.tipo, fila.cantidad, fila.fecha, fila.motivo);
}

async function obtenerMovimientoInventarios() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM movimiento_inventario`);
  return filas.map(mapFila);
}

async function obtenerMovimientoInventarioPorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM movimiento_inventario WHERE id_movimiento = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearMovimientoInventario(datos) {
  const [resultado] = await conexion.promise().query(
    'INSERT INTO movimiento_inventario (id_producto, tipo, cantidad, motivo) VALUES (?, ?, ?, ?)',
    [datos.id_producto, datos.tipo, datos.cantidad, datos.motivo]
  );
  return obtenerMovimientoInventarioPorId(resultado.insertId);
}

async function actualizarMovimientoInventario(id, datos) {
  await conexion.promise().query(
    'UPDATE movimiento_inventario SET id_producto = ?, tipo = ?, cantidad = ?, motivo = ? WHERE id_movimiento = ?',
    [datos.id_producto, datos.tipo, datos.cantidad, datos.motivo, id]
  );
  return obtenerMovimientoInventarioPorId(id);
}

async function eliminarMovimientoInventario(id) {
  await conexion.promise().query('DELETE FROM movimiento_inventario WHERE id_movimiento = ?', [id]);
}

module.exports = {
  obtenerMovimientoInventarios,
  obtenerMovimientoInventarioPorId,
  crearMovimientoInventario,
  actualizarMovimientoInventario,
  eliminarMovimientoInventario,
};
