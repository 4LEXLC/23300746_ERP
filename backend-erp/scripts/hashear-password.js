// Script de una sola vez: encripta las contraseñas que estaban en texto plano.
require('dotenv').config();
const bcrypt = require('bcrypt');
const conexion = require('../config/db');

async function main() {
  const [usuarios] = await conexion.promise().query('SELECT id_usuario, contrasena FROM usuario');
  for (const u of usuarios) {
    if (u.contrasena.startsWith('$2')) continue; // ya estaba encriptada
    const hash = await bcrypt.hash(u.contrasena, 10);
    await conexion.promise().query('UPDATE usuario SET contrasena = ? WHERE id_usuario = ?', [hash, u.id_usuario]);
  }
  console.log('Contraseñas encriptadas');
  conexion.end();
}

main();