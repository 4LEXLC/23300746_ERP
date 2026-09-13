class Permiso {
  constructor(id_permiso, id_trabajador, fecha_inicio, fecha_fin, tipo, motivo, estado) {
    this.id_permiso = id_permiso;
    this.id_trabajador = id_trabajador;
    this.fecha_inicio = fecha_inicio;
    this.fecha_fin = fecha_fin;
    this.tipo = tipo;
    this.motivo = motivo;
    this.estado = estado;
  }
}

module.exports = Permiso;
