// CRUD de proveedor: proveedores que entregan el producto ya preparado.
const conexion = require('../../config/db');
const Proveedor = require('../models/proveedor.model');

const COLUMNAS = 'id_proveedor, nombre, telefono, correo, direccion, estado';

function mapFila(fila) {
  return new Proveedor(fila.id_proveedor, fila.nombre, fila.telefono, fila.correo, fila.direccion, fila.estado);
}

async function obtenerProveedors() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM proveedor`);
  return filas.map(mapFila);
}

async function obtenerProveedorPorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM proveedor WHERE id_proveedor = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearProveedor(datos) {
  const [resultado] = await conexion.promise().query(
    'INSERT INTO proveedor (nombre, telefono, correo, direccion, estado) VALUES (?, ?, ?, ?, ?)',
    [datos.nombre, datos.telefono, datos.correo, datos.direccion, datos.estado]
  );
  return obtenerProveedorPorId(resultado.insertId);
}

async function actualizarProveedor(id, datos) {
  await conexion.promise().query(
    'UPDATE proveedor SET nombre = ?, telefono = ?, correo = ?, direccion = ?, estado = ? WHERE id_proveedor = ?',
    [datos.nombre, datos.telefono, datos.correo, datos.direccion, datos.estado, id]
  );
  return obtenerProveedorPorId(id);
}

async function eliminarProveedor(id) {
  await conexion.promise().query('DELETE FROM proveedor WHERE id_proveedor = ?', [id]);
}

module.exports = {
  obtenerProveedors,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
};
