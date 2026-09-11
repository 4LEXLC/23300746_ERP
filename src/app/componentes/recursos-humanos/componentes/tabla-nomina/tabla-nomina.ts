// Listado de pagos de nómina.
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { iniciales, PagoNomina } from '../../rh.models';

@Component({
  imports: [],
  selector: 'app-tabla-nomina',
  styleUrl: './tabla-nomina.css',
  templateUrl: './tabla-nomina.html',
})
export class TablaNomina {
  // Recibe datos del componente padre o le comunica acciones.
  @Input() pagos: PagoNomina[] = [];
  @Input() trabajadoresConPagoPendiente: string[] = [];
  @Output() registrarPago = new EventEmitter<void>();

  iniciales = iniciales;
}
