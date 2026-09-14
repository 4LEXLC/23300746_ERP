// CRUD de puesto: puestos de trabajo (cajero, barista, etc.).
const conexion = require('../../config/db');
const Puesto = require('../models/puesto.model');

const COLUMNAS = 'id_puesto, nombre, descripcion';

function mapFila(fila) {
  return new Puesto(fila.id_puesto, fila.nombre, fila.descripcion);
}

async function obtenerPuestos() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM puesto`);
  return filas.map(mapFila);
}

async function obtenerPuestoPorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM puesto WHERE id_puesto = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearPuesto(datos) {
  const [resultado] = await conexion.promise().query(
    'INSERT INTO puesto (nombre, descripcion) VALUES (?, ?)',
    [datos.nombre, datos.descripcion]
  );
  return obtenerPuestoPorId(resultado.insertId);
}

async function actualizarPuesto(id, datos) {
  await conexion.promise().query(
    'UPDATE puesto SET nombre = ?, descripcion = ? WHERE id_puesto = ?',
    [datos.nombre, datos.descripcion, id]
  );
  return obtenerPuestoPorId(id);
}

async function eliminarPuesto(id) {
  await conexion.promise().query('DELETE FROM puesto WHERE id_puesto = ?', [id]);
}

module.exports = {
  obtenerPuestos,
  obtenerPuestoPorId,
  crearPuesto,
  actualizarPuesto,
  eliminarPuesto,
};
