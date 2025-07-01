import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-coordinador',
  standalone: false,
  templateUrl: './dashboard-coordinador.component.html',
  styleUrls: ['./dashboard-coordinador.component.scss']
})
export class DashboardCoordinadorComponent {
  userMenuOpen = false;

  constructor(private router: Router) {}

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
    this.router.navigate(['/login']);
  }
}