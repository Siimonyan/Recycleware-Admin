import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      if (error.status === 0) {
        errorMessage = 'No hay conexión con el servidor';
      } else if (error.status === 401) {
        errorMessage = 'Sesión expirada o credenciales incorrectas';
        if (!router.url.includes('/login') && !req.url.includes('/logout')) {
          authService.logout();
        }
      } else if (error.status === 403) {
        errorMessage = 'No tienes permiso para realizar esta acción';
        if (!router.url.includes('/login')) {
          authService.logout();
        }
      } else if (error.status === 404) {
        errorMessage = 'El recurso solicitado no existe';
      } else if (error.status >= 500) {
        errorMessage = 'Error en el servidor. Inténtalo más tarde';
      }

      return throwError(() => ({
        ...error,
        message: errorMessage
      }));
    })
  );
};
