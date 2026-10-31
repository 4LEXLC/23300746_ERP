// Rutas HTTP (GET/POST/PUT/DELETE) para movimiento_inventario.
const express = require('express');
const { requiereRol } = require('../middleware/auth.middleware');
const {
  obtenerMovimientoInventarios,
  obtenerMovimientoInventarioPorId,
  crearMovimientoInventario,
  actualizarMovimientoInventario,
  eliminarMovimientoInventario,
} = require('../app/services/movimiento_inventario.service');

const router = express.Router();

router.get('/', requiereRol('admin'), async (req, res) => {
  try {
    res.json(await obtenerMovimientoInventarios());
  } catch (error) {
    console.error('Error al consultar movimiento_inventario:', error);
    res.status(500).json({ mensaje: 'No se pudieron obtener los registros de movimiento_inventario.' });
  }
});

router.get('/:id', requiereRol('admin'), async (req, res) => {
  try {
    const registro = await obtenerMovimientoInventarioPorId(req.params.id);
    if (!registro) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registro);
  } catch (error) {
    console.error('Error al consultar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo obtener el registro.' });
  }
});

router.post('/', async (req, res) => {
  // El cajero solo registra lo que genera una venta; el resto es del administrador.
  if (req.usuario.rol !== 'admin' && (req.body.tipo !== 'salida')) {
    return res.status(403).json({ mensaje: 'El cajero solo puede registrar salidas por venta.' });
  }
  try {
    const nuevoRegistro = await crearMovimientoInventario(req.body);
    res.status(201).json(nuevoRegistro);
  } catch (error) {
    console.error('Error al crear el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo crear el registro.' });
  }
});

router.put('/:id', requiereRol('admin'), async (req, res) => {
  try {
    const registroActualizado = await actualizarMovimientoInventario(req.params.id, req.body);
    if (!registroActualizado) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registroActualizado);
  } catch (error) {
    console.error('Error al actualizar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo actualizar el registro.' });
  }
});

router.delete('/:id', requiereRol('admin'), async (req, res) => {
  try {
    await eliminarMovimientoInventario(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo eliminar el registro.' });
  }
});

module.exports = router;
