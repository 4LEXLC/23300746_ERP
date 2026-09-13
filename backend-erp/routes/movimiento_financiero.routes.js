const express = require('express');
const {
  obtenerMovimientoFinancieros,
  obtenerMovimientoFinancieroPorId,
  crearMovimientoFinanciero,
  actualizarMovimientoFinanciero,
  eliminarMovimientoFinanciero,
} = require('../app/services/movimiento_financiero.service');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json(await obtenerMovimientoFinancieros());
  } catch (error) {
    console.error('Error al consultar movimiento_financiero:', error);
    res.status(500).json({ mensaje: 'No se pudieron obtener los registros de movimiento_financiero.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const registro = await obtenerMovimientoFinancieroPorId(req.params.id);
    if (!registro) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registro);
  } catch (error) {
    console.error('Error al consultar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo obtener el registro.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const nuevoRegistro = await crearMovimientoFinanciero(req.body);
    res.status(201).json(nuevoRegistro);
  } catch (error) {
    console.error('Error al crear el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo crear el registro.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const registroActualizado = await actualizarMovimientoFinanciero(req.params.id, req.body);
    if (!registroActualizado) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registroActualizado);
  } catch (error) {
    console.error('Error al actualizar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo actualizar el registro.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await eliminarMovimientoFinanciero(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo eliminar el registro.' });
  }
});

module.exports = router;
