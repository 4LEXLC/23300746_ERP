// CRUD de trabajador: trabajadores de la cafetería.
const conexion = require('../../config/db');
const Trabajador = require('../models/trabajador.model');

const SELECT_BASE = `
  SELECT t.id_trabajador, t.id_usuario, t.id_puesto, p.nombre AS puesto, t.nombre, t.telefono,
         t.correo, t.salario, t.fecha_contratacion, t.estado, h.dia, h.hora_entrada, h.hora_salida
  FROM trabajador t
  LEFT JOIN puesto p ON p.id_puesto = t.id_puesto
  LEFT JOIN horario h ON h.id_trabajador = t.id_trabajador
`;

function mapFila(fila) {
  return new Trabajador(
    fila.id_trabajador, fila.id_usuario, fila.id_puesto, fila.puesto, fila.nombre,
    fila.telefono, fila.correo, fila.salario, fila.fecha_contratacion, fila.estado,
    fila.dia, fila.hora_entrada, fila.hora_salida
  );
}

// Busca el puesto por nombre o lo crea si no existe (la tabla puesto ya existe en el esquema original).
async function resolverIdPuesto(nombrePuesto, idPuestoActual) {
  if (idPuestoActual) return idPuestoActual;
  if (!nombrePuesto) return null;
  const [filas] = await conexion.promise().query('SELECT id_puesto FROM puesto WHERE nombre = ?', [nombrePuesto]);
  if (filas.length) return filas[0].id_puesto;
  const [resultado] = await conexion.promise().query('INSERT INTO puesto (nombre) VALUES (?)', [nombrePuesto]);
  return resultado.insertId;
}

// Crea o reemplaza el único horario del trabajador (tabla horario ya existe en el esquema original).
async function guardarHorario(id_trabajador, dia, hora_entrada, hora_salida) {
  if (!dia) return;
  const [existentes] = await conexion.promise().query('SELECT id_horario FROM horario WHERE id_trabajador = ?', [id_trabajador]);
  if (existentes.length) {
    await conexion.promise().query(
      'UPDATE horario SET dia = ?, hora_entrada = ?, hora_salida = ? WHERE id_horario = ?',
      [dia, hora_entrada, hora_salida, existentes[0].id_horario]
    );
  } else {
    await conexion.promise().query(
      'INSERT INTO horario (id_trabajador, dia, hora_entrada, hora_salida) VALUES (?, ?, ?, ?)',
      [id_trabajador, dia, hora_entrada, hora_salida]
    );
  }
}

async function obtenerTrabajadors() {
  const [filas] = await conexion.promise().query(`${SELECT_BASE} ORDER BY t.id_trabajador`);
  return filas.map(mapFila);
}

async function obtenerTrabajadorPorId(id) {
  const [filas] = await conexion.promise().query(`${SELECT_BASE} WHERE t.id_trabajador = ?`, [id]);
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearTrabajador(datos) {
  const { id_usuario, id_puesto, puesto, nombre, telefono, correo, salario, fecha_contratacion, estado, dia, hora_entrada, hora_salida } = datos;
  const idPuestoResuelto = await resolverIdPuesto(puesto, id_puesto);
  const [resultado] = await conexion.promise().query(
    'INSERT INTO trabajador (id_usuario, id_puesto, nombre, telefono, correo, salario, fecha_contratacion, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id_usuario ?? null, idPuestoResuelto, nombre, telefono ?? null, correo ?? null, salario, fecha_contratacion || new Date(), estado ?? 'activo']
  );
  await guardarHorario(resultado.insertId, dia, hora_entrada, hora_salida);
  return obtenerTrabajadorPorId(resultado.insertId);
}

async function actualizarTrabajador(id, datos) {
  const { id_usuario, id_puesto, puesto, nombre, telefono, correo, salario, estado, dia, hora_entrada, hora_salida } = datos;
  const idPuestoResuelto = await resolverIdPuesto(puesto, id_puesto);
  await conexion.promise().query(
    'UPDATE trabajador SET id_usuario = ?, id_puesto = ?, nombre = ?, telefono = ?, correo = ?, salario = ?, estado = ? WHERE id_trabajador = ?',
    [id_usuario ?? null, idPuestoResuelto, nombre, telefono ?? null, correo ?? null, salario, estado, id]
  );
  await guardarHorario(id, dia, hora_entrada, hora_salida);
  return obtenerTrabajadorPorId(id);
}

async function eliminarTrabajador(id) {
  await conexion.promise().query('DELETE FROM trabajador WHERE id_trabajador = ?', [id]);
}

module.exports = {
  obtenerTrabajadors,
  obtenerTrabajadorPorId,
  crearTrabajador,
  actualizarTrabajador,
  eliminarTrabajador,
};
