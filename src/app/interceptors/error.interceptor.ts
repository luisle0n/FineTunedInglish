import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ha ocurrido un error inesperado';

        if (error.error instanceof ErrorEvent) {
          // Error del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del servidor
          switch (error.status) {
            case 400:
              errorMessage = 'Solicitud incorrecta';
              console.error('🔍 Error 400 completo:', error);
              console.error('🔍 Body del error:', error.error);
              if (error.error && error.error.message) {
                errorMessage += `: ${error.error.message}`;
              } else if (error.error && typeof error.error === 'string') {
                errorMessage += `: ${error.error}`;
              } else if (error.error && error.error.errors) {
                const validationErrors = Object.values(error.error.errors).flat();
                errorMessage += `: ${validationErrors.join(', ')}`;
              }
              break;
            case 401:
              errorMessage = 'No autorizado';
              this.authService.logout();
              this.router.navigate(['/login']);
              break;
            case 403:
              errorMessage = 'Acceso denegado';
              break;
            case 404:
              errorMessage = 'Recurso no encontrado';
              break;
            case 500:
              errorMessage = 'Error interno del servidor';
              break;
            default:
              errorMessage = `Error ${error.status}: ${error.message}`;
          }
        }

        // Log errors except 404 for development (handled gracefully by components)
        if (error.status !== 404) {
          console.error('Error interceptor:', errorMessage);
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
} 