import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-usuario-gerente',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent, HttpClientModule],
  templateUrl: './usuario-gerente.component.html',
  styleUrls: ['./usuario-gerente.component.scss']
})
export class UsuarioGerenteComponent implements OnInit {
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
  
  // Estados de modales
  showModalVer = false;
  showModalEliminados = false;
  
  // Usuario seleccionado
  usuarioSeleccionado: any = null;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarUsuariosEliminados();
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



  // === MÉTODOS DE MODALES ===
  cerrarModalVer() {
    this.showModalVer = false;
    this.usuarioSeleccionado = null;
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

  getUsuariosActivosCount(): number {
    return this.usuarios.filter(u => u.activo === true).length;
  }

  mostrarMensajeExito(mensaje: string) {
    alert(`✅ ${mensaje}`);
  }

  mostrarMensajeError(mensaje: string) {
    alert(`❌ ${mensaje}`);
  }
} 