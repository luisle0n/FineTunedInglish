import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiredRole = route.data['role'] as string;
    const userRole = this.authService.getUserRole();

    if (!userRole) {
      this.router.navigate(['/login']);
      return false;
    }

    if (requiredRole && userRole !== requiredRole) {
      // Redirigir según el rol del usuario
      switch (userRole) {
        case 'coordinador academico':
          this.router.navigate(['/coordinador/inicio']);
          break;
        case 'talento humano':
          this.router.navigate(['/talento-humano/inicio']);
          break;
        case 'gerencia':
          this.router.navigate(['/gerencia']);
          break;
        default:
          this.router.navigate(['/login']);
      }
      return false;
    }

    return true;
  }
} 