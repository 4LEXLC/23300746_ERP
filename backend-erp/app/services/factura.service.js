const conexion = require('../../config/db');
const Factura = require('../models/factura.model');

const COLUMNAS = 'id_factura, id_venta, id_cliente, folio, fecha_emision, estado';

function mapFila(fila) {
  return new Factura(fila.id_factura, fila.id_venta, fila.id_cliente, fila.folio, fila.fecha_emision, fila.estado);
}

async function obtenerFacturas() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM factura`);
  return filas.map(mapFila);
}

async function obtenerFacturaPorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM factura WHERE id_factura = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearFactura(datos) {
  const [resultado] = await conexion.promise().query(
    'INSERT INTO factura (id_venta, id_cliente, folio, estado) VALUES (?, ?, ?, ?)',
    [datos.id_venta, datos.id_cliente, datos.folio, datos.estado]
  );
  return obtenerFacturaPorId(resultado.insertId);
}

async function actualizarFactura(id, datos) {
  await conexion.promise().query(
    'UPDATE factura SET id_venta = ?, id_cliente = ?, folio = ?, estado = ? WHERE id_factura = ?',
    [datos.id_venta, datos.id_cliente, datos.folio, datos.estado, id]
  );
  return obtenerFacturaPorId(id);
}

async function eliminarFactura(id) {
  await conexion.promise().query('DELETE FROM factura WHERE id_factura = ?', [id]);
}

module.exports = {
  obtenerFacturas,
  obtenerFacturaPorId,
  crearFactura,
  actualizarFactura,
  eliminarFactura,
};
