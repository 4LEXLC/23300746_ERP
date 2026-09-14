// CRUD de usuario: usuarios que inician sesión en el sistema.
const conexion = require('../../config/db');
const Usuario = require('../models/usuario.model');

const COLUMNAS = 'id_usuario, nombre_usuario, contrasena, rol, activo';

function mapFila(fila) {
  return new Usuario(fila.id_usuario, fila.nombre_usuario, fila.contrasena, fila.rol, fila.activo);
}

async function obtenerUsuarios() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM usuario`);
  return filas.map(mapFila);
}

async function obtenerUsuarioPorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM usuario WHERE id_usuario = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearUsuario(datos) {
  const [resultado] = await conexion.promise().query(
    'INSERT INTO usuario (nombre_usuario, contrasena, rol, activo) VALUES (?, ?, ?, ?)',
    [datos.nombre_usuario, datos.contrasena, datos.rol, datos.activo]
  );
  return obtenerUsuarioPorId(resultado.insertId);
}

async function actualizarUsuario(id, datos) {
  await conexion.promise().query(
    'UPDATE usuario SET nombre_usuario = ?, contrasena = ?, rol = ?, activo = ? WHERE id_usuario = ?',
    [datos.nombre_usuario, datos.contrasena, datos.rol, datos.activo, id]
  );
  return obtenerUsuarioPorId(id);
}

async function eliminarUsuario(id) {
  await conexion.promise().query('DELETE FROM usuario WHERE id_usuario = ?', [id]);
}

async function loginUsuario(nombre_usuario, contrasena) {
  const [filas] = await conexion.promise().query(
    'SELECT id_usuario, nombre_usuario FROM usuario WHERE nombre_usuario = ? AND contrasena = ?',
    [nombre_usuario, contrasena]
  );
  if (!filas.length) return null;
  return { id_usuario: filas[0].id_usuario, nombre_usuario: filas[0].nombre_usuario };
}

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  loginUsuario,
};
