import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './docente-coordinador.component.html',
  styleUrls: ['./docente-coordinador.component.scss']
})
export class DocenteCoordinadorComponent {
  userMenuOpen = false;

  constructor(private router: Router) {}

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  cerrarMenu() {
    setTimeout(() => this.userMenuOpen = false, 150);  // ✅ Esto soluciona el error
  }

  verPerfil() {
    alert('Abrir vista de perfil');
    this.userMenuOpen = false;
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }
}
