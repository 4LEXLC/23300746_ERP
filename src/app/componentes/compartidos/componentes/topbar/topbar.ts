// Barra superior con datos de la sesión.
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  constructor(public authService: AuthService, private router: Router) {}

  // Cierra la sesión actual.
  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigateByUrl('/login');
  }
}
