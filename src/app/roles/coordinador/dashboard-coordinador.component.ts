import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-coordinador',
  standalone: false,
  templateUrl: './dashboard-coordinador.component.html',
  styleUrls: ['./dashboard-coordinador.component.scss']
})
export class DashboardCoordinadorComponent {
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