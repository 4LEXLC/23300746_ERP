// Alta y edición de cuentas de usuario.
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DatosUsuario, Usuario, UsuariosService } from '../compartidos/servicios/usuarios.service';
import { RhService } from '../compartidos/servicios/rh.service';
import { AvisoService } from '../compartidos/servicios/aviso.service';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios {
  constructor(
    public usuariosService: UsuariosService,
    public rhService: RhService,
    private aviso: AvisoService,
  ) {
    this.usuariosService.cargar();
    this.rhService.cargar();
  }

  editando: Usuario | null = null;
  datos: DatosUsuario = this.vacio();

  private vacio(): DatosUsuario {
    return { nombre_usuario: '', contrasena: '', rol: 'cajero', activo: true, id_trabajador: null };
  }

  editar(usuario: Usuario): void {
    this.editando = usuario;
    this.datos = { nombre_usuario: usuario.nombre_usuario, contrasena: '', rol: usuario.rol, activo: !!usuario.activo, id_trabajador: null };
  }

  limpiar(form: NgForm): void {
    this.editando = null;
    this.datos = this.vacio();
    form.resetForm(this.vacio());
  }

  guardar(form: NgForm): void {
    if (form.invalid) return;
    const esEdicion = !!this.editando;
    const peticion = this.editando
      ? this.usuariosService.editar(this.editando.id_usuario, this.datos)
      : this.usuariosService.agregar(this.datos);
    peticion.subscribe({
      next: () => {
        this.aviso.exito(esEdicion ? 'Usuario actualizado.' : 'Usuario creado.');
        this.limpiar(form);
      },
      error: (e) => this.aviso.error(e.error?.mensaje ?? 'No se pudo guardar el usuario.'),
    });
  }

  eliminar(usuario: Usuario): void {
    if (!confirm(`¿Eliminar la cuenta ${usuario.nombre_usuario}? No se puede deshacer.`)) return;
    this.usuariosService.eliminar(usuario.id_usuario).subscribe({
      next: () => this.aviso.exito('Usuario eliminado.'),
      error: (e) => this.aviso.error(e.error?.mensaje ?? 'No se pudo eliminar el usuario.'),
    });
  }
}
