// CRUD de factura: facturas generadas sobre una venta.
const conexion = require('../../config/db');
const Factura = require('../models/factura.model');

const COLUMNAS = 'id_factura, id_venta, id_cliente, folio, fecha_emision, estado';
const ESTADOS_FACTURA = ['vigente', 'cancelada'];

function mapFila(fila) {
  return new Factura(fila.id_factura, fila.id_venta, fila.id_cliente, fila.folio, fila.fecha_emision, fila.estado);
}

async function obtenerFacturas() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM factura`);
  return filas.map(mapFila);
}

async function obtenerFacturaPorId(id) {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM factura WHERE id_factura = ?`, [id]);
  return filas.length ? mapFila(filas[0]) : null;
}

// Solo se factura si el pago de la venta quedó completado.
async function pagoAprobado(idVenta) {
  const [filas] = await conexion.promise().query(
    "SELECT 1 FROM pago WHERE id_venta = ? AND estado = 'completado'",
    [idVenta]
  );
  return filas.length > 0;
}

// Evita dos facturas vigentes para la misma venta.
async function tieneFacturaVigente(idVenta) {
  const [filas] = await conexion.promise().query(
    "SELECT 1 FROM factura WHERE id_venta = ? AND estado = 'vigente'",
    [idVenta]
  );
  return filas.length > 0;
}

// Toma el número del folio más alto que ya existe y le suma 1, así nunca choca.
async function siguienteFolio() {
  const [filas] = await conexion.promise().query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(folio, 5) AS UNSIGNED)), 0) + 1 AS siguiente FROM factura WHERE folio LIKE 'FAC-%'"
  );
  return `FAC-${String(filas[0].siguiente).padStart(4, '0')}`;
}

async function crearFactura(datos) {
  const folio = await siguienteFolio();
  const [resultado] = await conexion.promise().query(
    'INSERT INTO factura (id_venta, id_cliente, folio, estado) VALUES (?, ?, ?, ?)',
    [datos.id_venta, datos.id_cliente, folio, 'vigente']
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

// Cancelar no borra la factura, solo le cambia el estado.
async function cancelarFactura(id) {
  await conexion.promise().query("UPDATE factura SET estado = 'cancelada' WHERE id_factura = ?", [id]);
  return obtenerFacturaPorId(id);
}

module.exports = {
  obtenerFacturas,
  obtenerFacturaPorId,
  crearFactura,
  actualizarFactura,
  cancelarFactura,
  pagoAprobado,
  tieneFacturaVigente,
  ESTADOS_FACTURA,
};
