// Captura de gastos de servicios y renta.
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DatosGasto {
  concepto: string;
  monto: number;
}

@Component({
  selector: 'app-formulario-gasto',
  imports: [FormsModule],
  templateUrl: './formulario-gasto.html',
  styleUrl: './formulario-gasto.css',
})
export class FormularioGasto {
  // Comunica al componente padre el cierre o el gasto capturado.
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<DatosGasto>();

  datos: DatosGasto = { concepto: '', monto: 0 };

  // Envía los datos si son válidos.
  onGuardar(): void {
    if (!this.datos.concepto.trim() || this.datos.monto <= 0) return;
    this.guardar.emit({ concepto: this.datos.concepto.trim(), monto: this.datos.monto });
  }
}
