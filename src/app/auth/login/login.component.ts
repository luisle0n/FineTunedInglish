import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Component({
    selector: 'app-login',
    standalone: false,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    cedula: string = '';
    contrasena: string = '';

    constructor(private router: Router, private http: HttpClient) { }

    onLogin() {
        const loginPayload = {
            username: this.cedula,
            password: this.contrasena
        };

        this.http.post<any>('http://localhost:3000/auth/login', loginPayload).subscribe({
            next: (res) => {
                const token = res.token; // ✅ ← esto es lo correcto según tu backend

                if (!token) {
                    alert('Token no recibido');
                    return;
                }

                localStorage.setItem('token', token);

                const decoded: any = jwtDecode(token);
                console.log('Token decodificado:', decoded);

                switch (decoded.rol) {
                    case 'coordinador academico':
                        this.router.navigate(['/coordinador/inicio']);
                        break;
                    case 'talento humano':
                        this.router.navigate(['/talento-humano/inicio']);
                        break;
                    case 'gerencia':
                        this.router.navigate(['/gerencia/inicio']);
                        break;
                    default:
                        alert('Rol desconocido');
                }
            },
            error: () => {
                alert('Credenciales incorrectas o error del servidor');
            }
        });
    }
}
