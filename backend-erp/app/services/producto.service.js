// CRUD de producto: productos (bebidas y repostería) que se venden.
const conexion = require('../../config/db');
const Producto = require('../models/producto.model');

const COLUMNAS = 'id_producto, nombre, descripcion, categoria, precio_venta, stock, stock_minimo, imagen, fecha_modificacion, activo';

function mapFila(fila) {
  return new Producto(
    fila.id_producto, fila.nombre, fila.descripcion, fila.categoria,
    fila.precio_venta, fila.stock, fila.stock_minimo, fila.imagen,
    fila.fecha_modificacion, fila.activo
  );
}

async function obtenerProductos() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM producto`);
  return filas.map(mapFila);
}

async function obtenerProductoPorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM producto WHERE id_producto = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearProducto(datos) {
  const { nombre, descripcion, categoria, precio_venta, stock, stock_minimo, imagen, activo } = datos;
  const [resultado] = await conexion.promise().query(
    'INSERT INTO producto (nombre, descripcion, categoria, precio_venta, stock, stock_minimo, imagen, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [nombre, descripcion, categoria, precio_venta, stock, stock_minimo, imagen, activo ?? true]
  );
  return obtenerProductoPorId(resultado.insertId);
}

async function actualizarProducto(id, datos) {
  const { nombre, descripcion, categoria, precio_venta, stock, stock_minimo, imagen, activo } = datos;
  await conexion.promise().query(
    'UPDATE producto SET nombre = ?, descripcion = ?, categoria = ?, precio_venta = ?, stock = ?, stock_minimo = ?, imagen = ?, activo = ? WHERE id_producto = ?',
    [nombre, descripcion, categoria, precio_venta, stock, stock_minimo, imagen, activo, id]
  );
  return obtenerProductoPorId(id);
}

async function eliminarProducto(id) {
  await conexion.promise().query('DELETE FROM producto WHERE id_producto = ?', [id]);
}

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
