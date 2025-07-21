import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule]
})
export class HeaderComponent implements OnInit {
  userMenuOpen = false;
  userRole: string = '';
  pageTitle: string = 'Inicio';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarRolUsuario();
    this.determinarTituloPagina();
  }

  // === CARGA DEL ROL DEL USUARIO ===
  cargarRolUsuario(): void {
    const role = this.authService.getUserRole();
    if (role) {
      // Convertir a mayúsculas
      this.userRole = role.toUpperCase();
      console.log('👤 Rol del usuario:', this.userRole);
    } else {
      console.error('❌ No se pudo obtener el rol del usuario');
      this.userRole = 'USUARIO';
    }
  }

  // === DETERMINAR TÍTULO DE LA PÁGINA ===
  determinarTituloPagina(): void {
    const currentUrl = this.router.url;
    
    if (currentUrl.includes('/inicio')) {
      this.pageTitle = 'Inicio';
    } else if (currentUrl.includes('/docente')) {
      this.pageTitle = 'Gestión de Docentes';
    } else if (currentUrl.includes('/horarios')) {
      this.pageTitle = 'Horarios';
    } else if (currentUrl.includes('/aulas')) {
      this.pageTitle = 'Vista Aulas';
    } else if (currentUrl.includes('/dashboard')) {
      this.pageTitle = 'Dashboard';
    } else if (currentUrl.includes('/profile')) {
      this.pageTitle = 'Mi Perfil';
    } else {
      this.pageTitle = 'Inicio';
    }
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  verPerfil() {
    // Navegar al perfil según el rol del usuario
    const role = this.authService.getUserRole();
    if (role === 'coordinador academico') {
      this.router.navigate(['/coordinador/profile']);
    } else if (role === 'talento humano') {
      this.router.navigate(['/talento-humano/profile']);
    } else if (role === 'gerencia') {
      this.router.navigate(['/gerencia/profile']);
    } else {
      this.router.navigate(['/coordinador/profile']); // fallback
    }
    this.userMenuOpen = false;
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 