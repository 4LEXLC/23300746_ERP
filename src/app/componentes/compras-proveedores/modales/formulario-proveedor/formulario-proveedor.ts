// Captura de datos del proveedor.
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DatosProveedor {
  nombre: string;
  telefono: string;
  correo: string;
  notas: string;
}

@Component({
  selector: 'app-formulario-proveedor',
  imports: [FormsModule],
  templateUrl: './formulario-proveedor.html',
  styleUrl: './formulario-proveedor.css',
})
export class FormularioProveedor {
  // Recibe datos del componente padre o le comunica acciones.
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<DatosProveedor>();

  datos: DatosProveedor = {
    nombre: '',
    telefono: '',
    correo: '',
    notas: '',
  };

  // Envía los datos al componente que abrió el formulario.
  onGuardar(): void {
    this.guardar.emit(this.datos);
  }
}
