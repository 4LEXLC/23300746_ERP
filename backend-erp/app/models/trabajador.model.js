class Trabajador {
  constructor(id_trabajador, id_usuario, id_puesto, puesto, nombre, telefono, correo, salario, fecha_contratacion, estado, dia, hora_entrada, hora_salida) {
    this.id_trabajador = id_trabajador;
    this.id_usuario = id_usuario;
    this.id_puesto = id_puesto;
    this.puesto = puesto;
    this.nombre = nombre;
    this.telefono = telefono;
    this.correo = correo;
    this.salario = salario;
    this.fecha_contratacion = fecha_contratacion;
    this.estado = estado;
    this.dia = dia;
    this.hora_entrada = hora_entrada;
    this.hora_salida = hora_salida;
  }
}

module.exports = Trabajador;
