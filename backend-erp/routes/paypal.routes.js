// Rutas HTTP para pagar con PayPal (tarjeta): token del SDK, crear orden y capturar el pago.
const express = require('express');
const { obtenerClientToken, crearOrden, capturarOrden } = require('../app/services/paypal.service');

const router = express.Router();

// Token seguro que el frontend usa para iniciar el SDK de PayPal.
router.get('/client-token', async (req, res) => {
  try {
    res.json({ clientToken: await obtenerClientToken() });
  } catch (error) {
    console.error('Error al pedir el client token:', error);
    res.status(500).json({ mensaje: 'No se pudo iniciar PayPal.' });
  }
});

// Recibe [{ id, cantidad }], calcula el total con los precios de la BD y crea la orden.
router.post('/orden', async (req, res) => {
  try {
    res.json(await crearOrden(req.body.productos));
  } catch (error) {
    console.error('Error al crear la orden:', error);
    res.status(400).json({ mensaje: error.message || 'No se pudo crear la orden.' });
  }
});

// Captura el pago de una orden ya aprobada.
router.post('/capturar/:orderId', async (req, res) => {
  try {
    res.json(await capturarOrden(req.params.orderId));
  } catch (error) {
    console.error('Error al capturar el pago:', error);
    res.status(400).json({ mensaje: error.message || 'No se pudo capturar el pago.' });
  }
});

module.exports = router;
