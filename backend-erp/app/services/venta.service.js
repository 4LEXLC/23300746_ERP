// CRUD de ventas: aquí se guarda cada venta que se hace en el punto de venta.
const conexion = require('../../config/db');
const Venta = require('../models/venta.model');

const COLUMNAS = 'id_venta, id_trabajador, fecha, productos, subtotal, iva, total, estado';

// obtenerVentas/obtenerVentaPorId = Read
// crearVenta = Create
// actualizarVenta = Update
// eliminarVenta = Delete

function mapFila(fila) {
  return new Venta(fila.id_venta, fila.id_trabajador, fila.fecha, fila.productos, fila.subtotal, fila.iva, fila.total, fila.estado);
}

async function obtenerVentas() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM venta ORDER BY id_venta DESC`);
  return filas.map(mapFila);
}

async function obtenerVentaPorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM venta WHERE id_venta = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

// La tabla venta exige id_trabajador; si no llega uno, se usa el primer trabajador activo como cajero.
async function resolverIdTrabajador(idTrabajador) {
  if (idTrabajador) return idTrabajador;
  const [filas] = await conexion.promise().query(
    "SELECT id_trabajador FROM trabajador WHERE estado = 'activo' ORDER BY id_trabajador LIMIT 1"
  );
  return filas.length ? filas[0].id_trabajador : null;
}

async function crearVenta(datos) {
  const idTrabajador = await resolverIdTrabajador(datos.id_trabajador);
  const [resultado] = await conexion.promise().query(
    'INSERT INTO venta (id_trabajador, productos, subtotal, iva, total, estado) VALUES (?, ?, ?, ?, ?, ?)',
    [idTrabajador, JSON.stringify(datos.productos ?? []), datos.subtotal, datos.iva, datos.total, datos.estado ?? 'completada']
  );
  return obtenerVentaPorId(resultado.insertId);
}

async function actualizarVenta(id, datos) {
  await conexion.promise().query(
    'UPDATE venta SET id_trabajador = ?, productos = ?, subtotal = ?, iva = ?, total = ?, estado = ? WHERE id_venta = ?',
    [datos.id_trabajador, JSON.stringify(datos.productos ?? []), datos.subtotal, datos.iva, datos.total, datos.estado, id]
  );
  return obtenerVentaPorId(id);
}

async function eliminarVenta(id) {
  await conexion.promise().query('DELETE FROM venta WHERE id_venta = ?', [id]);
}

module.exports = {
  obtenerVentas,
  obtenerVentaPorId,
  crearVenta,
  actualizarVenta,
  eliminarVenta,
};
