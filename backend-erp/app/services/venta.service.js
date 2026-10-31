// CRUD de ventas: aquí se guarda cada venta que se hace en el punto de venta.
const conexion = require('../../config/db');
const Venta = require('../models/venta.model');

// Trae el nombre del cajero junto con cada venta.
const SELECT_VENTA = `
  SELECT v.id_venta, v.id_trabajador, v.fecha, v.productos, v.subtotal, v.iva, v.total, v.estado,
         t.nombre AS cajero
  FROM venta v
  LEFT JOIN trabajador t ON t.id_trabajador = v.id_trabajador
`;

// obtenerVentas/obtenerVentaPorId = Read
// crearVenta = Create
// actualizarVenta = Update
// eliminarVenta = Delete

function mapFila(fila) {
  const venta = new Venta(fila.id_venta, fila.id_trabajador, fila.fecha, fila.productos, fila.subtotal, fila.iva, fila.total, fila.estado);
  venta.cajero = fila.cajero ?? null;
  return venta;
}

async function obtenerVentas() {
  const [filas] = await conexion.promise().query(`${SELECT_VENTA} ORDER BY v.id_venta DESC`);
  return filas.map(mapFila);
}

async function obtenerVentaPorId(id) {
  const [filas] = await conexion.promise().query(`${SELECT_VENTA} WHERE v.id_venta = ?`, [id]);
  return filas.length ? mapFila(filas[0]) : null;
}

// El trabajador sale del usuario que inició sesión.
async function trabajadorDelUsuario(idUsuario) {
  const [filas] = await conexion.promise().query(
    'SELECT id_trabajador FROM trabajador WHERE id_usuario = ?',
    [idUsuario]
  );
  return filas.length ? filas[0].id_trabajador : null;
}

async function crearVenta(datos) {
  const [resultado] = await conexion.promise().query(
    'INSERT INTO venta (id_trabajador, productos, subtotal, iva, total, estado) VALUES (?, ?, ?, ?, ?, ?)',
    [datos.id_trabajador, JSON.stringify(datos.productos), datos.subtotal, datos.iva, datos.total, 'pendiente']
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
  trabajadorDelUsuario,
};
