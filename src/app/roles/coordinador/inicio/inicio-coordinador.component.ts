import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';  // ✅ Agrega esto para NgIf

@Component({
  selector: 'app-inicio-coordinador',
  standalone: true,  // ✅ Si estás usando standalone
  imports: [CommonModule],  // ✅ Aquí importas NgIf, etc
  templateUrl: './inicio-coordinador.component.html',
  styleUrls: ['./inicio-coordinador.component.scss']
})
export class InicioCoordinadorComponent {
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
