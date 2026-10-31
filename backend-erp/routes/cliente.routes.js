// Rutas HTTP (GET/POST/PUT/DELETE) para cliente.
const express = require('express');
const { requiereRol } = require('../middleware/auth.middleware');
const {
  obtenerClientes,
  obtenerClientePorId,
  obtenerClientePorRfc,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} = require('../app/services/cliente.service');

const { validarCliente } = require('../app/validaciones');

const router = express.Router();

router.get('/', requiereRol('admin'), async (req, res) => {
  try {
    res.json(await obtenerClientes());
  } catch (error) {
    console.error('Error al consultar cliente:', error);
    res.status(500).json({ mensaje: 'No se pudieron obtener los registros de cliente.' });
  }
});

router.get('/:id', requiereRol('admin'), async (req, res) => {
  try {
    const registro = await obtenerClientePorId(req.params.id);
    if (!registro) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registro);
  } catch (error) {
    console.error('Error al consultar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo obtener el registro.' });
  }
});

router.post('/', async (req, res) => {
  try {
    req.body.rfc = String(req.body.rfc ?? '').trim().toUpperCase();
    const error = validarCliente(req.body);
    if (error) return res.status(400).json({ mensaje: error });

    // Si el RFC ya existe, se actualizan sus datos en vez de duplicar al cliente.
    const existente = await obtenerClientePorRfc(req.body.rfc);
    if (existente) return res.json(await actualizarCliente(existente.id_cliente, req.body));

    res.status(201).json(await crearCliente(req.body));
  } catch (error) {
    console.error('Error al crear el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo crear el registro.' });
  }
});

router.put('/:id', requiereRol('admin'), async (req, res) => {
  try {
    req.body.rfc = String(req.body.rfc ?? '').trim().toUpperCase();
    const error = validarCliente(req.body);
    if (error) return res.status(400).json({ mensaje: error });

    const registroActualizado = await actualizarCliente(req.params.id, req.body);
    if (!registroActualizado) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registroActualizado);
  } catch (error) {
    console.error('Error al actualizar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo actualizar el registro.' });
  }
});

router.delete('/:id', requiereRol('admin'), async (req, res) => {
  try {
    await eliminarCliente(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo eliminar el registro.' });
  }
});

module.exports = router;
