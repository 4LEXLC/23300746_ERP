// Agrega el token a todas las peticiones y saca al usuario si el token ya no sirve.
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../servicios/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.obtenerToken();

  const peticion = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(peticion).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.cerrarSesion();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};