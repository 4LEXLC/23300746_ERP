// Listado de trabajadores y acciones disponibles.
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { iniciales, Trabajador } from '../../rh.models';

@Component({
  imports: [],
  selector: 'app-tabla-trabajadores',
  styleUrl: './tabla-trabajadores.css',
  templateUrl: './tabla-trabajadores.html',
})
export class TablaTrabajadores {
  // Recibe datos del componente padre o le comunica acciones.
  @Input() trabajadores: Trabajador[] = [];
  @Output() cambiarEstado = new EventEmitter<Trabajador>();
  @Output() editar = new EventEmitter<Trabajador>();
  @Output() registrarAsistencia = new EventEmitter<Trabajador>();

  iniciales = iniciales;
}
