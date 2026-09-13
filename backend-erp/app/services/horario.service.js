const conexion = require('../../config/db');
const Horario = require('../models/horario.model');

const COLUMNAS = 'id_horario, id_trabajador, dia, hora_entrada, hora_salida';

function mapFila(fila) {
  return new Horario(fila.id_horario, fila.id_trabajador, fila.dia, fila.hora_entrada, fila.hora_salida);
}

async function obtenerHorarios() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM horario`);
  return filas.map(mapFila);
}

async function obtenerHorarioPorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM horario WHERE id_horario = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearHorario(datos) {
  const [resultado] = await conexion.promise().query(
    'INSERT INTO horario (id_trabajador, dia, hora_entrada, hora_salida) VALUES (?, ?, ?, ?)',
    [datos.id_trabajador, datos.dia, datos.hora_entrada, datos.hora_salida]
  );
  return obtenerHorarioPorId(resultado.insertId);
}

async function actualizarHorario(id, datos) {
  await conexion.promise().query(
    'UPDATE horario SET id_trabajador = ?, dia = ?, hora_entrada = ?, hora_salida = ? WHERE id_horario = ?',
    [datos.id_trabajador, datos.dia, datos.hora_entrada, datos.hora_salida, id]
  );
  return obtenerHorarioPorId(id);
}

async function eliminarHorario(id) {
  await conexion.promise().query('DELETE FROM horario WHERE id_horario = ?', [id]);
}

module.exports = {
  obtenerHorarios,
  obtenerHorarioPorId,
  crearHorario,
  actualizarHorario,
  eliminarHorario,
};
