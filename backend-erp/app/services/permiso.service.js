// CRUD de permiso: solicitudes de permisos/vacaciones de trabajadores.
const conexion = require('../../config/db');
const Permiso = require('../models/permiso.model');

const COLUMNAS = 'id_permiso, id_trabajador, fecha_inicio, fecha_fin, tipo, motivo, estado';

function mapFila(fila) {
  return new Permiso(fila.id_permiso, fila.id_trabajador, fila.fecha_inicio, fila.fecha_fin, fila.tipo, fila.motivo, fila.estado);
}

async function obtenerPermisos() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM permiso`);
  return filas.map(mapFila);
}

async function obtenerPermisoPorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM permiso WHERE id_permiso = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearPermiso(datos) {
  const [resultado] = await conexion.promise().query(
    'INSERT INTO permiso (id_trabajador, fecha_inicio, fecha_fin, tipo, motivo, estado) VALUES (?, ?, ?, ?, ?, ?)',
    [datos.id_trabajador, datos.fecha_inicio, datos.fecha_fin, datos.tipo, datos.motivo, datos.estado]
  );
  return obtenerPermisoPorId(resultado.insertId);
}

async function actualizarPermiso(id, datos) {
  await conexion.promise().query(
    'UPDATE permiso SET id_trabajador = ?, fecha_inicio = ?, fecha_fin = ?, tipo = ?, motivo = ?, estado = ? WHERE id_permiso = ?',
    [datos.id_trabajador, datos.fecha_inicio, datos.fecha_fin, datos.tipo, datos.motivo, datos.estado, id]
  );
  return obtenerPermisoPorId(id);
}

async function eliminarPermiso(id) {
  await conexion.promise().query('DELETE FROM permiso WHERE id_permiso = ?', [id]);
}

module.exports = {
  obtenerPermisos,
  obtenerPermisoPorId,
  crearPermiso,
  actualizarPermiso,
  eliminarPermiso,
};
