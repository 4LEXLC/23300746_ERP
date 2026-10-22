// Captura de pagos de salario.
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
  // Recibe datos del componente padre o le comunica acciones.
  @Input() trabajadores: string[] = [];
  @Input() salarios: Record<string, number> = {};
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<DatosPagoSalario>();

  datos: DatosPagoSalario = {
    trabajador: '',
    periodoInicio: '',
    periodoFin: '',
    monto: 0,
    fechaPago: '',
  };

  // Sugiere el salario del trabajador elegido.
  alElegirTrabajador(nombre: string): void {
    this.datos.monto = this.salarios[nombre] ?? 0;
  }

  // Envía los datos al componente que abrió el formulario.
  onGuardar(): void {
    this.guardar.emit({ ...this.datos });
  }
}
