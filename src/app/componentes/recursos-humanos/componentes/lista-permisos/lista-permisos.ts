import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Permiso } from '../../rh.models';

@Component({
  imports: [],
  selector: 'app-lista-permisos',
  styleUrl: './lista-permisos.css',
  templateUrl: './lista-permisos.html',
})
export class ListaPermisos {
  @Input() permisos: Permiso[] = [];
  @Output() nuevaSolicitud = new EventEmitter<void>();
  @Output() aprobar = new EventEmitter<Permiso>();
  @Output() rechazar = new EventEmitter<Permiso>();
}
