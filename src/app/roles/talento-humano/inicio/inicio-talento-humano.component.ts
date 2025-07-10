import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';  // ✅ Agrega esto para NgIf

@Component({
  standalone: true,
  selector: 'app-inicio-coordinador',
  templateUrl: './inicio-talento-humano.component.html',
  styleUrls: ['./inicio-talento-humano.component.scss'],
  imports: [CommonModule]
})

export class InicioTalentoHuemanoComponent {
  userMenuOpen = false;

  constructor(private router: Router) {}

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  verPerfil() {
    alert('Abrir vista de perfil');
    this.userMenuOpen = false;
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }
}
