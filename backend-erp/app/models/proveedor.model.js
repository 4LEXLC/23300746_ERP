class Proveedor {
  constructor(id_proveedor, nombre, telefono, correo, direccion, estado) {
    this.id_proveedor = id_proveedor;
    this.nombre = nombre;
    this.telefono = telefono;
    this.correo = correo;
    this.direccion = direccion;
    this.estado = estado;
  }
}

module.exports = Proveedor;
