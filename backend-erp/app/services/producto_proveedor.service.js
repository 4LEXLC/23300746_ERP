// CRUD de producto_proveedor: qué proveedor surte cada producto y a qué precio.
const conexion = require('../../config/db');
const ProductoProveedor = require('../models/producto_proveedor.model');

const COLUMNAS = 'id_producto_proveedor, id_producto, id_proveedor, precio_compra';

function mapFila(fila) {
  return new ProductoProveedor(fila.id_producto_proveedor, fila.id_producto, fila.id_proveedor, fila.precio_compra);
}

async function obtenerProductoProveedors() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM producto_proveedor`);
  return filas.map(mapFila);
}

async function obtenerProductoProveedorPorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM producto_proveedor WHERE id_producto_proveedor = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearProductoProveedor(datos) {
  const [resultado] = await conexion.promise().query(
    'INSERT INTO producto_proveedor (id_producto, id_proveedor, precio_compra) VALUES (?, ?, ?)',
    [datos.id_producto, datos.id_proveedor, datos.precio_compra]
  );
  return obtenerProductoProveedorPorId(resultado.insertId);
}

async function actualizarProductoProveedor(id, datos) {
  await conexion.promise().query(
    'UPDATE producto_proveedor SET id_producto = ?, id_proveedor = ?, precio_compra = ? WHERE id_producto_proveedor = ?',
    [datos.id_producto, datos.id_proveedor, datos.precio_compra, id]
  );
  return obtenerProductoProveedorPorId(id);
}

async function eliminarProductoProveedor(id) {
  await conexion.promise().query('DELETE FROM producto_proveedor WHERE id_producto_proveedor = ?', [id]);
}

module.exports = {
  obtenerProductoProveedors,
  obtenerProductoProveedorPorId,
  crearProductoProveedor,
  actualizarProductoProveedor,
  eliminarProductoProveedor,
};
