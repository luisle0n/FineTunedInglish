import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  usuario: any = null;
  modoEdicion = false;
  cargando = true;
  error = false;
  guardando = false;

  // Datos editables
  datosEditables = {
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    cedula: '',
    correo: '',
    telefono: ''
  };

  // Datos originales para cancelar edición
  datosOriginales: any = null;

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarPerfilUsuario();
  }

  cargarPerfilUsuario() {
    this.cargando = true;
    this.error = false;

    // Obtener el UID del usuario logueado usando AuthService
    const decodedToken = this.authService.getDecodedToken();
    console.log('🔍 Token decodificado:', decodedToken);
    
    if (!decodedToken) {
      console.error('❌ No se pudo decodificar el token');
      this.error = true;
      this.cargando = false;
      return;
    }

    const uid = decodedToken.sub;
    console.log('🔍 UID encontrado:', uid);
    
    if (!uid) {
      console.error('❌ No se encontró UID en el token');
      this.error = true;
      this.cargando = false;
      return;
    }

    console.log('🚀 Haciendo petición GET a:', `http://localhost:3000/usuarios/${uid}`);

    // Hacer la petición GET para obtener los datos del usuario
    this.http.get(`http://localhost:3000/usuarios/${uid}`).subscribe({
      next: (data: any) => {
        console.log('📦 Datos del usuario recibidos:', data);
        this.usuario = data;
        
        // Preparar datos editables
        this.datosEditables = {
          primer_nombre: data.persona?.primer_nombre || '',
          segundo_nombre: data.persona?.segundo_nombre || '',
          primer_apellido: data.persona?.primer_apellido || '',
          segundo_apellido: data.persona?.segundo_apellido || '',
          cedula: data.persona?.cedula || '',
          correo: data.persona?.correo || '',
          telefono: data.persona?.telefono || ''
        };

        // Guardar datos originales
        this.datosOriginales = { ...this.datosEditables };
        
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error cargando perfil:', err);
        console.error('❌ Status:', err.status);
        console.error('❌ Mensaje:', err.message);
        this.error = true;
        this.cargando = false;
      }
    });
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    // Restaurar datos originales
    this.datosEditables = { ...this.datosOriginales };
  }

  guardarCambios() {
    this.guardando = true;

    // Validar que los campos requeridos no estén vacíos
    if (!this.datosEditables.primer_nombre || !this.datosEditables.primer_apellido || 
        !this.datosEditables.cedula || !this.datosEditables.correo) {
      alert('Por favor complete todos los campos requeridos');
      this.guardando = false;
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.datosEditables.correo)) {
      alert('Por favor ingrese un correo electrónico válido');
      this.guardando = false;
      return;
    }

    // Validar formato de teléfono (solo números)
    const phoneRegex = /^\d+$/;
    if (this.datosEditables.telefono && !phoneRegex.test(this.datosEditables.telefono)) {
      alert('El teléfono debe contener solo números');
      this.guardando = false;
      return;
    }

    // Obtener el UID del usuario usando AuthService
    const decodedToken = this.authService.getDecodedToken();
    if (!decodedToken) {
      alert('Error: No se pudo obtener la información del usuario');
      this.guardando = false;
      return;
    }
    const uid = decodedToken.sub;

    // Preparar los datos para enviar en la estructura que espera el backend
    const datosParaEnviar = {
      uid: uid, // Incluir el UID en el cuerpo
      primer_nombre: this.datosEditables.primer_nombre,
      segundo_nombre: this.datosEditables.segundo_nombre,
      primer_apellido: this.datosEditables.primer_apellido,
      segundo_apellido: this.datosEditables.segundo_apellido,
      cedula: this.datosEditables.cedula,
      correo: this.datosEditables.correo,
      telefono: this.datosEditables.telefono
    };

    console.log('🚀 Haciendo petición PATCH a:', `http://localhost:3000/usuarios`);
    console.log('📤 Datos a enviar:', datosParaEnviar);
    console.log('🔍 UID en cuerpo:', uid);
    console.log('📋 Estructura de datos:', JSON.stringify(datosParaEnviar, null, 2));

    // Hacer la petición PATCH para actualizar los datos
    this.http.patch(`http://localhost:3000/usuarios`, datosParaEnviar).subscribe({
      next: (response) => {
        console.log('✅ Perfil actualizado correctamente:', response);
        
        // Actualizar datos del usuario en el componente
        if (this.usuario && this.usuario.persona) {
          this.usuario.persona = { ...this.usuario.persona, ...this.datosEditables };
        }
        
        // Actualizar datos originales
        this.datosOriginales = { ...this.datosEditables };
        
        this.modoEdicion = false;
        this.guardando = false;
        
        alert('Perfil actualizado correctamente');
      },
      error: (err) => {
        console.error('❌ Error actualizando perfil:', err);
        console.error('❌ Status:', err.status);
        console.error('❌ Status Text:', err.statusText);
        console.error('❌ Error completo:', JSON.stringify(err, null, 2));
        this.guardando = false;
        alert(`Error al actualizar el perfil (${err.status}): ${err.message || 'Error desconocido'}`);
      }
    });
  }

  obtenerNombreCompleto(): string {
    if (!this.usuario?.persona) return '';
    
    const nombres = [
      this.usuario.persona.primer_nombre,
      this.usuario.persona.segundo_nombre
    ].filter(Boolean).join(' ');
    
    const apellidos = [
      this.usuario.persona.primer_apellido,
      this.usuario.persona.segundo_apellido
    ].filter(Boolean).join(' ');
    
    return `${nombres} ${apellidos}`.trim();
  }

  obtenerRolFormateado(): string {
    if (!this.usuario?.rol?.nombre) return '';
    return this.usuario.rol.nombre.toUpperCase();
  }
} 