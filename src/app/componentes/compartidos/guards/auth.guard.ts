
// Solo deja entrar si hay sesión activa.
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../servicios/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.estaAutenticado() ? true : router.createUrlTree(['/login']);
};