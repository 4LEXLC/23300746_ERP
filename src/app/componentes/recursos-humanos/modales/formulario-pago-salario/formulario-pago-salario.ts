import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DatosPagoSalario {
  trabajador: string;
  periodoInicio: string;
  periodoFin: string;
  monto: number;
  fechaPago: string;
}

@Component({
  selector: 'app-formulario-pago-salario',
  imports: [FormsModule],
  templateUrl: './formulario-pago-salario.html',
  styleUrl: './formulario-pago-salario.css',
})
export class FormularioPagoSalario {
  @Input() trabajadores: string[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<DatosPagoSalario>();

  datos: DatosPagoSalario = {
    trabajador: '',
    periodoInicio: '',
    periodoFin: '',
    monto: 0,
    fechaPago: '',
  };

  onGuardar(): void {
    this.guardar.emit(this.datos);
  }
}
