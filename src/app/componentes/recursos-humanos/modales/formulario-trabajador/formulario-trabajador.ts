// Captura y edición de trabajadores.
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Trabajador } from '../../rh.models';

export interface DatosTrabajador {
  nombre: string;
  telefono: string;
  correo: string;
  puesto: string;
  salario: number;
  fechaContratacion: string;
  dias: string;
  horaEntrada: string;
  horaSalida: string;
}

@Component({
  selector: 'app-formulario-trabajador',
  imports: [FormsModule],
  templateUrl: './formulario-trabajador.html',
  styleUrl: './formulario-trabajador.css',
})
export class FormularioTrabajador {
  // Recibe datos del componente padre o le comunica acciones.
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<DatosTrabajador>();

  puestos = ['Cajero', 'Barista', 'Auxiliar de cocina', 'Repostero(a)', 'Encargado(a) de turno'];
  diasDisponibles = ['Lun–Vie', 'Mar–Sáb', 'Mié–Dom', 'Sáb–Dom'];

  editando = false;

  // Separa el horario y carga los datos del trabajador.
  @Input() set trabajadorEditar(trabajador: Trabajador | null) {
    if (!trabajador) return;
    const [dias, horas] = trabajador.horario.split(' · ');
    const [horaEntrada, horaSalida] = (horas ?? '').split('-');
    this.datos = {
      nombre: trabajador.nombre,
      telefono: '',
      correo: trabajador.correo === '—' ? '' : trabajador.correo,
      puesto: trabajador.puesto,
      salario: trabajador.salario,
      fechaContratacion: '',
      dias: this.diasDisponibles.includes(dias) ? dias : this.diasDisponibles[0],
      horaEntrada: horaEntrada || '08:00',
      horaSalida: horaSalida || '16:00',
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

  // Envía los datos al componente que abrió el formulario.
  onGuardar(): void {
    this.guardar.emit(this.datos);
  }
}
