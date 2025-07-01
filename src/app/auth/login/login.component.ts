import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
    selector: 'app-login',
    standalone: false,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    cedula: string = '';
    contrasena: string = '';

    constructor(private router: Router) { }

    onLogin() {
        if (this.cedula === '1103456789' && this.contrasena === '123456') {
            this.router.navigate(['/coordinador/inicio']);
        } else if (this.cedula === '1104567890' && this.contrasena === '123456') {
            this.router.navigate(['/talento-humano/inicio']);
        } else if (this.cedula === '1105678901' && this.contrasena === '123456') {
            this.router.navigate(['/gerencia/inicio']);
        } else {
            alert('Credenciales incorrectas');
        }
    }
}
