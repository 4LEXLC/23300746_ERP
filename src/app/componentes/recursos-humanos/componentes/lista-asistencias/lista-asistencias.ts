// Listado de asistencias y su estado.
import { Component, Input } from '@angular/core';
import { Asistencia, iniciales } from '../../rh.models';

@Component({
  imports: [],
  selector: 'app-lista-asistencias',
  styleUrl: './lista-asistencias.css',
  templateUrl: './lista-asistencias.html',
})
export class ListaAsistencias {
  // Recibe datos del componente padre o le comunica acciones.
  @Input() asistencias: Asistencia[] = [];

  iniciales = iniciales;
}
