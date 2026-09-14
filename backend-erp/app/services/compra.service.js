// CRUD de compra: compras de café/producto ya preparado a los proveedores.
const conexion = require('../../config/db');
const Compra = require('../models/compra.model');

const COLUMNAS = 'id_compra, id_proveedor, fecha, productos, total, estado';

function mapFila(fila) {
  return new Compra(fila.id_compra, fila.id_proveedor, fila.fecha, fila.productos, fila.total, fila.estado);
}

async function obtenerCompras() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM compra ORDER BY id_compra DESC`);
  return filas.map(mapFila);
}

async function obtenerCompraPorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM compra WHERE id_compra = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearCompra(datos) {
  const [resultado] = await conexion.promise().query(
    'INSERT INTO compra (id_proveedor, productos, total, estado) VALUES (?, ?, ?, ?)',
    [datos.id_proveedor, JSON.stringify(datos.productos ?? []), datos.total, datos.estado ?? 'pendiente']
  );
  return obtenerCompraPorId(resultado.insertId);
}

async function actualizarCompra(id, datos) {
  await conexion.promise().query(
    'UPDATE compra SET id_proveedor = ?, productos = ?, total = ?, estado = ? WHERE id_compra = ?',
    [datos.id_proveedor, JSON.stringify(datos.productos ?? []), datos.total, datos.estado, id]
  );
  return obtenerCompraPorId(id);
}

async function eliminarCompra(id) {
  await conexion.promise().query('DELETE FROM compra WHERE id_compra = ?', [id]);
}

module.exports = {
  obtenerCompras,
  obtenerCompraPorId,
  crearCompra,
  actualizarCompra,
  eliminarCompra,
};
