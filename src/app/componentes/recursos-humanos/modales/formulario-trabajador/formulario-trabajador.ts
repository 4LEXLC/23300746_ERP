// Alta y edición de trabajadores.
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatosTrabajador, Trabajador } from '../../rh.models';

@Component({
  selector: 'app-formulario-trabajador',
  imports: [FormsModule],
  templateUrl: './formulario-trabajador.html',
  styleUrl: './formulario-trabajador.css',
})
export class FormularioTrabajador {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<DatosTrabajador>();

  puestos = ['Cajero', 'Barista', 'Auxiliar de cocina', 'Repostero(a)', 'Encargado(a) de turno'];
  diasDisponibles = ['Lun–Vie', 'Mar–Sáb', 'Mié–Dom', 'Sáb–Dom'];

  editando = false;
  errorHorario = '';

  // Carga los datos del trabajador cuando se abre para editar.
  @Input() set trabajadorEditar(t: Trabajador | null) {
    if (!t) return;
    this.datos = {
      nombre: t.nombre,
      telefono: t.telefono ?? '',
      correo: t.correo === '—' ? '' : t.correo,
      puesto: t.puesto,
      salario: t.salario,
      fechaContratacion: t.fechaContratacion ?? '',
      dias: t.dias && this.diasDisponibles.includes(t.dias) ? t.dias : this.diasDisponibles[0],
      horaEntrada: t.horaEntrada || '08:00',
      horaSalida: t.horaSalida || '16:00',
    };
    this.editando = true;
  }

  datos: DatosTrabajador = {
    nombre: '',
    telefono: '',
    correo: '',
    puesto: this.puestos[0],
    salario: 0,
    fechaContratacion: '',
    dias: this.diasDisponibles[0],
    horaEntrada: '08:00',
    horaSalida: '16:00',
  };

  // La salida tiene que ser después de la entrada.
  onGuardar(): void {
    if (this.datos.horaSalida <= this.datos.horaEntrada) {
      this.errorHorario = 'La hora de salida debe ser posterior a la de entrada.';
      return;
    }
    this.errorHorario = '';
    this.guardar.emit({ ...this.datos, nombre: this.datos.nombre.trim() });
  }
}
