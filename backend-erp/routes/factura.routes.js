// Rutas HTTP (GET/POST/PUT/DELETE) para factura.
const express = require('express');
const { generarXmlFactura } = require('../app/services/xml-factura.service');
const { enviarFactura } = require('../app/services/correo.service');

const {
  obtenerFacturas,
  obtenerFacturaPorId,
  crearFactura,
  actualizarFactura,
  eliminarFactura,
} = require('../app/services/factura.service');

const router = express.Router();

// Genera el XML y lo manda por correo. Si falla ya se guardo.
async function mandarFacturaPorCorreo(id_factura) {
  try {
    const factura = await generarXmlFactura(id_factura);
    const destino = factura.correo || process.env.CORREO_PRUEBAS;

    if (!destino) {
      console.log(`La factura ${factura.folio} no tiene correo; no se envió.`);
      return;
    }

    await enviarFactura({ para: destino, ...factura });
    console.log(`Factura ${factura.folio} enviada a ${destino}`);
  } catch (error) {
    console.error('No se pudo enviar la factura por correo:', error.message);
  }
}

router.get('/', async (req, res) => {
  try {
    res.json(await obtenerFacturas());
  } catch (error) {
    console.error('Error al consultar factura:', error);
    res.status(500).json({ mensaje: 'No se pudieron obtener los registros de factura.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const registro = await obtenerFacturaPorId(req.params.id);
    if (!registro) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registro);
  } catch (error) {
    console.error('Error al consultar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo obtener el registro.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const nuevoRegistro = await crearFactura(req.body);
    res.status(201).json(nuevoRegistro);
    mandarFacturaPorCorreo(nuevoRegistro.id_factura)
  } catch (error) {
    console.error('Error al crear el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo crear el registro.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const registroActualizado = await actualizarFactura(req.params.id, req.body);
    if (!registroActualizado) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registroActualizado);
  } catch (error) {
    console.error('Error al actualizar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo actualizar el registro.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await eliminarFactura(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo eliminar el registro.' });
  }
});

module.exports = router;
