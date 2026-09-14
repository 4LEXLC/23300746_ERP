// Rutas HTTP (GET/POST/PUT/DELETE) para producto.
const express = require('express');
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require('../app/services/producto.service');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json(await obtenerProductos());
  } catch (error) {
    console.error('Error al consultar productos:', error);
    res.status(500).json({ mensaje: 'No se pudieron obtener los productos.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const producto = await obtenerProductoPorId(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    res.json(producto);
  } catch (error) {
    console.error('Error al consultar el producto:', error);
    res.status(500).json({ mensaje: 'No se pudo obtener el producto.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const nuevoProducto = await crearProducto(req.body);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ mensaje: 'No se pudo crear el producto.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const productoActualizado = await actualizarProducto(req.params.id, req.body);
    if (!productoActualizado) return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    res.json(productoActualizado);
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ mensaje: 'No se pudo actualizar el producto.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await eliminarProducto(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ mensaje: 'No se pudo eliminar el producto.' });
  }
});

module.exports = router;
