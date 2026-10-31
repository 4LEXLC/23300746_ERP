// Captura y edición de proveedores.
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatosProveedor } from '../../../compartidos/servicios/compras.service';

@Component({
  selector: 'app-formulario-proveedor',
  imports: [FormsModule],
  templateUrl: './formulario-proveedor.html',
  styleUrl: './formulario-proveedor.css',
})
export class FormularioProveedor {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<DatosProveedor>();

  editando = false;

  // Carga los datos cuando se abre para editar.
  @Input() set proveedorEditar(proveedor: DatosProveedor | null) {
    if (!proveedor) return;
    this.datos = { ...proveedor };
    this.editando = true;
  }

  datos: DatosProveedor = {
    nombre: '',
    telefono: '',
    correo: '',
    notas: '',
  };

  onGuardar(): void {
    this.guardar.emit({ ...this.datos, nombre: this.datos.nombre.trim() });
  }
}
