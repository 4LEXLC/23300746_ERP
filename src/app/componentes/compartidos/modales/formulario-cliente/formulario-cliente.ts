// Captura y edición de los datos fiscales del cliente.
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatosCliente } from '../../servicios/ventas.service';

@Component({
  selector: 'app-formulario-cliente',
  imports: [FormsModule],
  templateUrl: './formulario-cliente.html',
  styleUrl: './formulario-cliente.css',
})
export class FormularioCliente {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<DatosCliente>();

  regimenes = ['General de Ley Personas Morales', 'Régimen de Incorporación Fiscal', 'Sueldos y Salarios'];
  editando = false;

  // Carga los datos cuando se abre para editar.
  @Input() set clienteEditar(cliente: DatosCliente | null) {
    if (!cliente) return;
    this.datos = { ...cliente };
    this.editando = true;
  }

  datos: DatosCliente = {
    nombre: '',
    rfc: '',
    codigoPostal: '',
    regimenFiscal: '',
    correo: '',
  };

  onGuardar(): void {
    this.guardar.emit({ ...this.datos, rfc: this.datos.rfc.trim().toUpperCase() });
  }
}
