import { Component, EventEmitter, Input, Output } from '@angular/core';
import { iniciales, Trabajador } from '../../rh.models';

@Component({
  imports: [],
  selector: 'app-tabla-trabajadores',
  styleUrl: './tabla-trabajadores.css',
  templateUrl: './tabla-trabajadores.html',
})
export class TablaTrabajadores {
  @Input() trabajadores: Trabajador[] = [];
  @Output() cambiarEstado = new EventEmitter<Trabajador>();
  @Output() editar = new EventEmitter<Trabajador>();
  @Output() registrarAsistencia = new EventEmitter<Trabajador>();

  iniciales = iniciales;
}
