const conexion = require('../../config/db');
const Cliente = require('../models/cliente.model');

const COLUMNAS = 'id_cliente, nombre, razon_social, rfc, correo, codigo_postal, regimen_fiscal';

function mapFila(fila) {
  return new Cliente(fila.id_cliente, fila.nombre, fila.razon_social, fila.rfc, fila.correo, fila.codigo_postal, fila.regimen_fiscal);
}

async function obtenerClientes() {
  const [filas] = await conexion.promise().query(`SELECT ${COLUMNAS} FROM cliente`);
  return filas.map(mapFila);
}

async function obtenerClientePorId(id) {
  const [filas] = await conexion.promise().query(
    `SELECT ${COLUMNAS} FROM cliente WHERE id_cliente = ?`,
    [id]
  );
  return filas.length ? mapFila(filas[0]) : null;
}

async function crearCliente(datos) {
  const [resultado] = await conexion.promise().query(
    'INSERT INTO cliente (nombre, razon_social, rfc, correo, codigo_postal, regimen_fiscal) VALUES (?, ?, ?, ?, ?, ?)',
    [datos.nombre, datos.razon_social, datos.rfc, datos.correo, datos.codigo_postal, datos.regimen_fiscal]
  );
  return obtenerClientePorId(resultado.insertId);
}

async function actualizarCliente(id, datos) {
  await conexion.promise().query(
    'UPDATE cliente SET nombre = ?, razon_social = ?, rfc = ?, correo = ?, codigo_postal = ?, regimen_fiscal = ? WHERE id_cliente = ?',
    [datos.nombre, datos.razon_social, datos.rfc, datos.correo, datos.codigo_postal, datos.regimen_fiscal, id]
  );
  return obtenerClientePorId(id);
}

async function eliminarCliente(id) {
  await conexion.promise().query('DELETE FROM cliente WHERE id_cliente = ?', [id]);
}

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};
