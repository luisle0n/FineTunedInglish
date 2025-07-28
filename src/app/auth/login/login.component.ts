import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../shared/services/loading.service';
import { CustomValidators } from '../../shared/validators/custom-validators';
// import * as AuthActions from '../../store/auth/auth.actions';
// import { selectAuthLoading, selectAuthError } from '../../store/auth/auth.state';

@Component({
    selector: 'app-login',
    standalone: false,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;
    
    // Toast properties
    showToast = false;
    toastMessage = '';
    toastType: 'success' | 'error' | 'info' | 'warning' = 'success';

    constructor(
        private router: Router,
        private authService: AuthService,
        private loadingService: LoadingService,
        private formBuilder: FormBuilder
        // private store: Store
    ) {
        this.loading$ = of(false); // Temporary placeholder
        this.error$ = of(null); // Temporary placeholder
    }

    ngOnInit(): void {
        this.initForm();
    }

    private initForm(): void {
        this.loginForm = this.formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });
    }

    onLogin(): void {
        if (this.loginForm.valid) {
            const { username, password } = this.loginForm.value;
            
            this.loadingService.show('Iniciando sesión...', 'login');
            
            this.authService.login({ username, password }).subscribe({
                next: (response) => {
                    this.loadingService.hide('login');
                    
                    if (response.token) {
                        const successMessage = response.message || '¡Bienvenido! Sesión iniciada correctamente';
                        this.showToastMessage(successMessage, 'success');
                        const decoded = this.authService.getDecodedToken();
                        if (decoded) {
                            setTimeout(() => {
                                switch (decoded.rol) {
                                    case 'coordinador academico':
                                        this.router.navigate(['/coordinador/inicio']);
                                        break;
                                    case 'talento humano':
                                        this.router.navigate(['/talento-humano/inicio']);
                                        break;
                                    case 'gerente':
                                        this.router.navigate(['/gerente/inicio']);
                                        break;
                                    default:
                                        this.showToastMessage('Rol desconocido', 'error');
                                }
                            }, 1500);
                        }
                    }
                },
                error: (error) => {
                    this.loadingService.hide('login');
                    console.error('Error en login:', error);
                    
                    let errorMessage = 'Error al iniciar sesión';
                    let errorType: 'success' | 'error' | 'info' | 'warning' = 'error';
                    
                    if (error.status === 401) {
                        if (error.error && error.error.message) {
                            errorMessage = error.error.message;
                        } else {
                            errorMessage = 'Usuario o contraseña incorrectos';
                        }
                    } else if (error.status === 404) {
                        if (error.error && error.error.message) {
                            errorMessage = error.error.message;
                        } else {
                            errorMessage = 'Usuario no encontrado';
                        }
                    } else if (error.status === 0) {
                        errorMessage = 'Error de conexión. Verifica tu internet';
                    } else if (error.status === 500) {
                        if (error.error && error.error.message) {
                            errorMessage = error.error.message;
                        } else {
                            errorMessage = 'Error interno del servidor';
                        }
                    } else if (error.error && error.error.message) {
                        errorMessage = error.error.message;
                    }
                    
                    this.showToastMessage(errorMessage, errorType);
                }
            });
        } else {
            this.markFormGroupTouched();
            this.showToastMessage('Por favor, completa todos los campos', 'warning');
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.loginForm.controls).forEach(key => {
            const control = this.loginForm.get(key);
            control?.markAsTouched();
        });
    }

    getErrorMessage(controlName: string): string {
        const control = this.loginForm.get(controlName);
        
        if (control?.errors && control.touched) {
            if (control.errors['required']) {
                return 'Este campo es requerido';
            }
        }
        
        return '';
    }

    showToastMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
        this.toastMessage = message;
        this.toastType = type;
        this.showToast = true;
        
        setTimeout(() => {
            this.showToast = false;
        }, 4000);
    }
}
