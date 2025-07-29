import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileComponent } from '../../../shared/components/profile/profile.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-usuario-coordinador',
  standalone: true,
  imports: [HeaderComponent, CommonModule, RouterModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './usuario.coordinador.component.html',
  styleUrls: ['./usuario.coordinador.component.scss']
})
export class UsuarioCoordinadorComponent implements OnInit {
  // Lista de usuarios
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  usuariosEliminados: any[] = [];
  
  // Estados de carga
  cargando = true;
  cargandoEliminados = false;
  error = false;
  errorEliminados = false;
  
  // Filtros
  filtroRol = 'todos';
  filtroBusqueda = '';
  filtroEstado = 'todos';
  
  // Roles disponibles
  roles = [
    { value: 'todos', label: 'Todos' },
    { value: 'coordinador academico', label: 'Coordinador Académico' },
    { value: 'talento humano', label: 'Talento Humano' },
    { value: 'gerente', label: 'Gerente' }
  ];
  
  // Formularios
  usuarioForm!: FormGroup;
  editarForm!: FormGroup;
  
  // Estados de modales
  showForm = false;
  showModalVer = false;
  showModalEditar = false;
  showModalEliminados = false;
  
  // Estados de operaciones
  creando = false;
  editando = false;
  eliminando = false;
  restaurando = false;
  
  // Usuario seleccionado
  usuarioSeleccionado: any = null;
  usuarioEditando: any = null;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.inicializarFormularios();
  }

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarUsuariosEliminados();
  }

  inicializarFormularios() {
    // Formulario para crear usuario
    this.usuarioForm = this.fb.group({
      rolNombre: ['', Validators.required],
      primer_nombre: ['', Validators.required],
      segundo_nombre: [''],
      primer_apellido: ['', Validators.required],
      segundo_apellido: [''],
      cedula: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      password: ['', Validators.required]
    });

    // Formulario para editar usuario
    this.editarForm = this.fb.group({
      uid: ['', Validators.required],
      rolNombre: [''],
      primer_nombre: [''],
      segundo_nombre: [''],
      primer_apellido: [''],
      segundo_apellido: [''],
      cedula: [''],
      correo: ['', Validators.email],
      telefono: [''],
      password: [''],
      activo: [true]
    });
  }

  // === CARGA DE DATOS ===
  cargarUsuarios() {
    this.cargando = true;
    this.error = false;
    
    this.http.get<any[]>('http://localhost:3000/usuarios').subscribe({
      next: (response: any) => {
        if (response.success && response.usuarios) {
          this.usuarios = response.usuarios;
        } else {
          this.usuarios = response || [];
        }
        this.filtrarUsuarios();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.error = true;
        this.cargando = false;
      }
    });
  }

  cargarUsuariosEliminados() {
    this.cargandoEliminados = true;
    this.errorEliminados = false;
    
    this.http.get<any[]>('http://localhost:3000/usuarios/eliminados').subscribe({
      next: (response: any) => {
        if (response.success && response.usuarios) {
          this.usuariosEliminados = response.usuarios;
        } else {
          this.usuariosEliminados = response || [];
        }
        this.cargandoEliminados = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios eliminados:', err);
        this.errorEliminados = true;
        this.cargandoEliminados = false;
      }
    });
  }

  // === FILTRADO ===
  filtrarUsuarios() {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const cumpleRol = this.filtroRol === 'todos' || 
        usuario.rol?.nombre?.toLowerCase() === this.filtroRol ||
        usuario.rolNombre?.toLowerCase() === this.filtroRol;
      
      const cumpleBusqueda = !this.filtroBusqueda || 
        usuario.persona?.primer_nombre?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        usuario.persona?.primer_apellido?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        usuario.persona?.cedula?.includes(this.filtroBusqueda) ||
        usuario.correo?.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      
      const cumpleEstado = this.filtroEstado === 'todos' || 
        (this.filtroEstado === 'activos' && usuario.activo === true) ||
        (this.filtroEstado === 'inactivos' && usuario.activo === false);
      
      return cumpleRol && cumpleBusqueda && cumpleEstado;
    });
  }

  onFiltroRolChange() {
    this.filtrarUsuarios();
  }

  onFiltroBusquedaChange() {
    this.filtrarUsuarios();
  }

  onFiltroEstadoChange() {
    this.filtrarUsuarios();
  }

  resetearFiltros() {
    this.filtroRol = 'todos';
    this.filtroBusqueda = '';
    this.filtroEstado = 'todos';
    this.filtrarUsuarios();
  }

  // === OPERACIONES CRUD ===
  crearUsuario() {
    if (this.usuarioForm.invalid) {
      this.mostrarMensajeError('Por favor complete todos los campos requeridos');
      return;
    }

    this.creando = true;
    const datosUsuario = this.usuarioForm.value;
    
    console.log('📤 JSON a enviar al crear usuario:', JSON.stringify(datosUsuario, null, 2));
    
    this.http.post('http://localhost:3000/usuarios', datosUsuario).subscribe({
      next: (response: any) => {
        console.log('✅ Usuario creado exitosamente:', response);
        this.mostrarMensajeExito('Usuario creado exitosamente');
        this.usuarioForm.reset();
        this.cargarUsuarios();
        this.creando = false;
        this.showForm = false;
      },
      error: (error) => {
        console.error('❌ Error al crear usuario:', error);
        this.mostrarMensajeError('Error al crear el usuario. Verifica los datos ingresados.');
        this.creando = false;
      }
    });
  }

  editarUsuario(usuario: any) {
    this.usuarioEditando = usuario;
    
    this.editarForm.patchValue({
      uid: usuario.uid || usuario.id,
      rolNombre: usuario.rol?.nombre || usuario.rolNombre || '',
      primer_nombre: usuario.persona?.primer_nombre || usuario.primer_nombre || '',
      segundo_nombre: usuario.persona?.segundo_nombre || usuario.segundo_nombre || '',
      primer_apellido: usuario.persona?.primer_apellido || usuario.primer_apellido || '',
      segundo_apellido: usuario.persona?.segundo_apellido || usuario.segundo_apellido || '',
      cedula: usuario.persona?.cedula || usuario.cedula || '',
      correo: usuario.correo || '',
      telefono: usuario.persona?.telefono || usuario.telefono || '',
      activo: usuario.activo !== false
    });
    
    this.showModalEditar = true;
  }

  guardarEdicion() {
    if (this.editarForm.invalid) {
      this.mostrarMensajeError('Por favor complete los campos requeridos');
      return;
    }

    this.editando = true;
    const datosEdicion = this.editarForm.value;
    
    console.log('📤 JSON a enviar al editar usuario:', JSON.stringify(datosEdicion, null, 2));
    
    this.http.patch('http://localhost:3000/usuarios/admin', datosEdicion).subscribe({
      next: (response: any) => {
        console.log('✅ Usuario editado exitosamente:', response);
        this.mostrarMensajeExito('Usuario editado exitosamente');
        this.cargarUsuarios();
        this.cargarUsuariosEliminados();
        this.editando = false;
        this.showModalEditar = false;
        this.usuarioEditando = null;
      },
      error: (error) => {
        console.error('❌ Error al editar usuario:', error);
        this.mostrarMensajeError('Error al editar el usuario');
        this.editando = false;
      }
    });
  }

  eliminarUsuario(usuario: any) {
    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar al usuario ${usuario.persona?.primer_nombre || usuario.primer_nombre} ${usuario.persona?.primer_apellido || usuario.primer_apellido}?`);
    
    if (!confirmacion) return;

    this.eliminando = true;
    const uid = usuario.uid || usuario.id;
    
    this.http.delete(`http://localhost:3000/usuarios/${uid}`).subscribe({
      next: (response: any) => {
        console.log('✅ Usuario eliminado exitosamente:', response);
        this.mostrarMensajeExito('Usuario eliminado exitosamente');
        this.cargarUsuarios();
        this.cargarUsuariosEliminados();
        this.eliminando = false;
      },
      error: (error) => {
        console.error('❌ Error al eliminar usuario:', error);
        this.mostrarMensajeError('Error al eliminar el usuario');
        this.eliminando = false;
      }
    });
  }

  restaurarUsuario(usuario: any) {
    const confirmacion = confirm(`¿Estás seguro de que quieres restaurar al usuario ${usuario.persona?.primer_nombre || usuario.primer_nombre} ${usuario.persona?.primer_apellido || usuario.primer_apellido}?`);
    
    if (!confirmacion) return;

    this.restaurando = true;
    const uid = usuario.uid || usuario.id;
    
    this.http.patch(`http://localhost:3000/usuarios/${uid}/restaurar`, {}).subscribe({
      next: (response: any) => {
        console.log('✅ Usuario restaurado exitosamente:', response);
        this.mostrarMensajeExito('Usuario restaurado exitosamente');
        this.cargarUsuarios();
        this.cargarUsuariosEliminados();
        this.restaurando = false;
      },
      error: (error) => {
        console.error('❌ Error al restaurar usuario:', error);
        this.mostrarMensajeError('Error al restaurar el usuario');
        this.restaurando = false;
      }
    });
  }

  // === MÉTODOS DE MODALES ===
  mostrarFormulario() {
    this.showForm = true;
  }

  cancelarFormulario() {
    this.showForm = false;
    this.usuarioForm.reset();
  }

  cerrarModalVer() {
    this.showModalVer = false;
    this.usuarioSeleccionado = null;
  }

  cerrarModalEditar() {
    this.showModalEditar = false;
    this.usuarioEditando = null;
    this.editarForm.reset();
  }

  verUsuario(usuario: any) {
    this.usuarioSeleccionado = usuario;
    this.showModalVer = true;
  }

  cambiarVistaUsuarios() {
    this.showModalEliminados = !this.showModalEliminados;
  }

  // === MÉTODOS AUXILIARES ===
  getNombreCompleto(usuario: any): string {
    const persona = usuario.persona || usuario;
    return `${persona.primer_nombre || ''} ${persona.segundo_nombre || ''} ${persona.primer_apellido || ''} ${persona.segundo_apellido || ''}`.trim();
  }

  getRolUsuario(usuario: any): string {
    return usuario.rol?.nombre || usuario.rolNombre || 'Sin rol';
  }

  getEstadoUsuario(usuario: any): string {
    return usuario.activo === true ? 'Activo' : 'Inactivo';
  }

  getEstadoClass(usuario: any): string {
    return usuario.activo === true ? 'activo' : 'inactivo';
  }

  mostrarMensajeExito(mensaje: string) {
    alert(`✅ ${mensaje}`);
  }

  mostrarMensajeError(mensaje: string) {
    alert(`❌ ${mensaje}`);
  }

  getUsuariosActivosCount(): number {
    return this.usuarios.filter(u => u.activo === true).length;
  }
}