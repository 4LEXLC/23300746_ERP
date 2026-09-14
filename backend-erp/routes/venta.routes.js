const express = require('express');
const {
  obtenerVentas,
  obtenerVentaPorId,
  crearVenta,
  actualizarVenta,
  eliminarVenta,
} = require('../app/services/venta.service');

const router = express.Router();

// GET  /api/venta      -> lista todas las ventas
// GET  /api/venta/:id  -> una venta en específico
// POST /api/venta      -> crea una venta nueva (la usa el punto de venta al cobrar)
// PUT  /api/venta/:id  -> edita una venta
// DELETE /api/venta/:id -> elimina una venta
router.get('/', async (req, res) => {
  try {
    res.json(await obtenerVentas());
  } catch (error) {
    console.error('Error al consultar venta:', error);
    res.status(500).json({ mensaje: 'No se pudieron obtener los registros de venta.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const registro = await obtenerVentaPorId(req.params.id);
    if (!registro) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registro);
  } catch (error) {
    console.error('Error al consultar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo obtener el registro.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const nuevoRegistro = await crearVenta(req.body);
    res.status(201).json(nuevoRegistro);
  } catch (error) {
    console.error('Error al crear el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo crear el registro.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const registroActualizado = await actualizarVenta(req.params.id, req.body);
    if (!registroActualizado) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registroActualizado);
  } catch (error) {
    console.error('Error al actualizar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo actualizar el registro.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await eliminarVenta(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo eliminar el registro.' });
  }
});

module.exports = router;
