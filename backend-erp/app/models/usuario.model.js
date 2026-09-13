class Usuario {
  constructor(id_usuario, nombre_usuario, contrasena, rol, activo) {
    this.id_usuario = id_usuario;
    this.nombre_usuario = nombre_usuario;
    this.contrasena = contrasena;
    this.rol = rol;
    this.activo = activo;
  }
}

module.exports = Usuario;
