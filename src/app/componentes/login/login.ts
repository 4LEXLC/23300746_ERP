// Inicio de sesión con usuarios de demostración.
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../compartidos/servicios/auth.service';
import { Footer } from '../compartidos/componentes/footer/footer/footer';

@Component({
  imports: [FormsModule, Footer],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  constructor(private router: Router, private authService: AuthService) {}

  usuario = '';
  contrasena = '';
  error = '';

  // Valida las credenciales e inicia la sesión.
  iniciarSesion(): void {
    if (!this.usuario.trim() || !this.contrasena.trim()) {
      this.error = 'Ingresa tu usuario y contraseña para continuar.';
      return;
    }

    this.authService.iniciarSesion(this.usuario, this.contrasena).subscribe((exito) => {
      if (!exito) {
        this.error = 'Usuario o contraseña incorrectos.';
        return;
      }

      this.error = '';
      const destino = this.authService.obtenerRol() === 'admin' ? '/dashboard' : '/punto-venta';
      this.router.navigateByUrl(destino);
    });
  }
}
