// Revisa que el rol del usuario esté en los roles permitidos de la ruta.
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../servicios/auth.service';

export const rolGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const rolesPermitidos: string[] = route.data['roles'] ?? [];

  if (!authService.estaAutenticado()) return router.createUrlTree(['/login']);
  if (authService.tieneRol(rolesPermitidos)) return true;

  // Si no tiene permiso, lo regresa a su pantalla principal.
  const inicio = authService.obtenerRol() === 'admin' ? '/dashboard' : '/punto-venta';
  return router.createUrlTree([inicio]);
};