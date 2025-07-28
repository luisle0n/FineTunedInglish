import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-dashboard-gerencia',
    standalone: false,
    templateUrl: './dashboard-gerencia.component.html',
    styleUrls: ['./dashboard-gerencia.component.scss']
})
export class DashboardGerenciaComponent { 
    userMenuOpen = false;

  constructor(private router: Router, private authService: AuthService) {}

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  cerrarMenu() {
    setTimeout(() => this.userMenuOpen = false, 150);  // Delay para permitir clics
  }

  verPerfil() {
    alert('Abrir vista de perfil');
    this.userMenuOpen = false;
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
