class Horario {
  constructor(id_horario, id_trabajador, dia, hora_entrada, hora_salida) {
    this.id_horario = id_horario;
    this.id_trabajador = id_trabajador;
    this.dia = dia;
    this.hora_entrada = hora_entrada;
    this.hora_salida = hora_salida;
  }
}

module.exports = Horario;
