class Asistencia {
  constructor(id_asistencia, id_trabajador, nombre, fecha, hora_entrada, hora_salida, estado) {
    this.id_asistencia = id_asistencia;
    this.id_trabajador = id_trabajador;
    this.nombre = nombre;
    this.fecha = fecha;
    this.hora_entrada = hora_entrada;
    this.hora_salida = hora_salida;
    this.estado = estado;
  }
}

module.exports = Asistencia;
