// Valida el token JWT y el rol del usuario antes de dejar pasar la petición.
const jwt = require('jsonwebtoken');

// Revisa que la petición traiga un token JWT válido.
function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Token requerido' });
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ mensaje: 'Token invalido o expirado' });
  }
}

// Solo deja pasar si el rol del usuario está en la lista de roles permitidos.
function requiereRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permisos' });
    }
    next();
  };
}

module.exports = { verificarToken, requiereRol };