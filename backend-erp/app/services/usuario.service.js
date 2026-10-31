// CRUD de usuario: usuarios que inician sesión en el sistema.
const conexion = require('../../config/db');
const Usuario = require('../models/usuario.model');
const bcrypt =require('bcrypt');
const jwt = require('jsonwebtoken');

const COLUMNAS = 'id_usuario, nombre_usuario, contrasena, rol, activo';

// No regresa la contraseña al navegador, ni siquiera el hash.
function mapFila(fila) {
  return new Usuario(fila.id_usuario, fila.nombre_usuario, undefined, fila.rol, fila.activo);
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
  const hash = await bcrypt.hash(datos.contrasena, 10);
  const [resultado] = await conexion.promise().query(
    'INSERT INTO usuario (nombre_usuario, contrasena, rol, activo) VALUES (?, ?, ?, ?)',
    [datos.nombre_usuario.trim(), hash, datos.rol, datos.activo ?? true]
  );
  // Si eligieron un trabajador, se liga a este usuario (la venta lo usa para saber quién cobró).
  if (datos.id_trabajador) {
    await conexion.promise().query(
      'UPDATE trabajador SET id_usuario = ? WHERE id_trabajador = ?',
      [resultado.insertId, datos.id_trabajador]
    );
  }
  return obtenerUsuarioPorId(resultado.insertId);
}

// Si no mandan contraseña nueva, se queda la que ya tenía.
async function actualizarUsuario(id, datos) {
  if (datos.contrasena) {
    const hash = await bcrypt.hash(datos.contrasena, 10);
    await conexion.promise().query('UPDATE usuario SET contrasena = ? WHERE id_usuario = ?', [hash, id]);
  }
  await conexion.promise().query(
    'UPDATE usuario SET nombre_usuario = ?, rol = ?, activo = ? WHERE id_usuario = ?',
    [datos.nombre_usuario.trim(), datos.rol, datos.activo, id]
  );
  return obtenerUsuarioPorId(id);
}

// Revisa si otro usuario ya usa ese nombre.
async function nombreUsuarioOcupado(nombre, idExcluir = 0) {
  const [filas] = await conexion.promise().query(
    'SELECT 1 FROM usuario WHERE nombre_usuario = ? AND id_usuario <> ?',
    [String(nombre).trim(), idExcluir]
  );
  return filas.length > 0;
}

// Primero se desliga del trabajador para que no truene la llave foránea.
async function eliminarUsuario(id) {
  await conexion.promise().query('UPDATE trabajador SET id_usuario = NULL WHERE id_usuario = ?', [id]);
  await conexion.promise().query('DELETE FROM usuario WHERE id_usuario = ?', [id]);
}

async function loginUsuario(nombre_usuario, contrasena) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM usuario WHERE nombre_usuario = ? AND activo = 1`,
    [nombre_usuario]
  );

  if (!filas.length) return null;

  const usuario= filas[0];
  const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!coincide) return null;

  const token =jwt.sign(
    {id_usuario: usuario.id_usuario, rol: usuario.rol },
    process.env.JWT_SECRET,
    {expiresIn: '1h'}
  );
  return {token, nombre_usuario: usuario.nombre_usuario, rol: usuario.rol };
}

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  loginUsuario,
  nombreUsuarioOcupado,
};
