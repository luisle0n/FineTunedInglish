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

    // Toast notification properties
    showToast = false;
    toastMessage = '';
    toastType: 'success' | 'error' | 'info' | 'warning' = 'success';

  constructor(private router: Router, private authService: AuthService) {}

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  cerrarMenu() {
    setTimeout(() => this.userMenuOpen = false, 150);  // Delay para permitir clics
  }

  showToastMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  verPerfil() {
    this.showToastMessage('Abrir vista de perfil', 'info');
    this.userMenuOpen = false;
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
