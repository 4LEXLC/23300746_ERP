const conexion = require('../../config/db');
const Asistencia = require('../models/asistencia.model');

const SELECT_BASE = `
  SELECT a.id_asistencia, a.id_trabajador, t.nombre, a.fecha, a.hora_entrada, a.hora_salida, a.estado
  FROM asistencia a
  LEFT JOIN trabajador t ON t.id_trabajador = a.id_trabajador
`;

function mapFila(fila) {
  return new Asistencia(fila.id_asistencia, fila.id_trabajador, fila.nombre, fila.fecha, fila.hora_entrada, fila.hora_salida, fila.estado);
}

async function obtenerAsistencias() {
  const [filas] = await conexion.promise().query(`${SELECT_BASE} ORDER BY a.fecha DESC, a.id_asistencia DESC`);
  return filas.map(mapFila);
}

async function obtenerAsistenciaPorId(id) {
  const [filas] = await conexion.promise().query(`${SELECT_BASE} WHERE a.id_asistencia = ?`, [id]);
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearAsistencia(datos) {
  const { id_trabajador, fecha, hora_entrada, hora_salida, estado } = datos;
  const [resultado] = await conexion.promise().query(
    'INSERT INTO asistencia (id_trabajador, fecha, hora_entrada, hora_salida, estado) VALUES (?, ?, ?, ?, ?)',
    [id_trabajador, fecha ?? new Date(), hora_entrada ?? null, hora_salida ?? null, estado ?? 'presente']
  );
  return obtenerAsistenciaPorId(resultado.insertId);
}

async function actualizarAsistencia(id, datos) {
  const { id_trabajador, fecha, hora_entrada, hora_salida, estado } = datos;
  await conexion.promise().query(
    'UPDATE asistencia SET id_trabajador = ?, fecha = ?, hora_entrada = ?, hora_salida = ?, estado = ? WHERE id_asistencia = ?',
    [id_trabajador, fecha, hora_entrada ?? null, hora_salida ?? null, estado, id]
  );
  return obtenerAsistenciaPorId(id);
}

async function eliminarAsistencia(id) {
  await conexion.promise().query('DELETE FROM asistencia WHERE id_asistencia = ?', [id]);
}

module.exports = {
  obtenerAsistencias,
  obtenerAsistenciaPorId,
  crearAsistencia,
  actualizarAsistencia,
  eliminarAsistencia,
};
