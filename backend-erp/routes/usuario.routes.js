const {verificarToken, requiereRol} = require ('../middleware/auth.middleware');

// Rutas HTTP (GET/POST/PUT/DELETE) para usuario.
const express = require('express');
const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  loginUsuario,
  nombreUsuarioOcupado,
} = require('../app/services/usuario.service');
const { validarUsuario } = require('../app/validaciones');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { nombre_usuario, contrasena } = req.body;
    if (!nombre_usuario || !contrasena) {
      return res.status(400).json({ mensaje: 'Usuario y contraseña son obligatorios.' });
    }
    const usuario = await loginUsuario(nombre_usuario, contrasena);
    if (!usuario) return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
    res.json(usuario);
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ mensaje: 'No se pudo iniciar sesión.' });
  }
});

router.use(verificarToken,requiereRol('admin'));

router.get('/', async (req, res) => {
  try {
    res.json(await obtenerUsuarios());
  } catch (error) {
    console.error('Error al consultar usuario:', error);
    res.status(500).json({ mensaje: 'No se pudieron obtener los registros de usuario.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const registro = await obtenerUsuarioPorId(req.params.id);
    if (!registro) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registro);
  } catch (error) {
    console.error('Error al consultar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo obtener el registro.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const error = validarUsuario(req.body, true);
    if (error) return res.status(400).json({ mensaje: error });
    // Nombre de usuario único.
    if (await nombreUsuarioOcupado(req.body.nombre_usuario)) {
      return res.status(409).json({ mensaje: 'Ese nombre de usuario ya existe.' });
    }
    const nuevoRegistro = await crearUsuario(req.body);
    res.status(201).json(nuevoRegistro);
  } catch (error) {
    console.error('Error al crear el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo crear el registro.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const error = validarUsuario(req.body, false);
    if (error) return res.status(400).json({ mensaje: error });
    if (await nombreUsuarioOcupado(req.body.nombre_usuario, req.params.id)) {
      return res.status(409).json({ mensaje: 'Ese nombre de usuario ya existe.' });
    }
    const registroActualizado = await actualizarUsuario(req.params.id, req.body);
    if (!registroActualizado) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registroActualizado);
  } catch (error) {
    console.error('Error al actualizar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo actualizar el registro.' });
  }
});

router.delete('/:id', async (req, res) => {
  if (Number(req.params.id) === req.usuario.id_usuario) {
    return res.status(400).json({ mensaje: 'No puedes eliminar tu propia cuenta.' });
  }
  try {
    await eliminarUsuario(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ mensaje: 'No se pudo eliminar el usuario.' });
  }
});

module.exports = router;
