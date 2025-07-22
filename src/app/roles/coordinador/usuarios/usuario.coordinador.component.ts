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
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  filtroRol = 'todos';
  roles = [
    { value: 'todos', label: 'Todos' },
    { value: 'coordinador academico', label: 'Coordinador Académico' },
    { value: 'talento humano', label: 'Talento Humano' },
    { value: 'gerente', label: 'Gerente' }
  ];
  usuarioForm: FormGroup;
  creando = false;
  showForm = false;
  usuarioSeleccionado: any = null;
  showModalVer = false;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.usuarioForm = this.fb.group({
      rolNombre: ['', Validators.required],
      primer_nombre: ['', Validators.required],
      segundo_nombre: [''],
      primer_apellido: ['', Validators.required],
      segundo_apellido: [''],
      cedula: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.http.get<any[]>('http://localhost:3000/usuarios').subscribe(data => {
      this.usuarios = data;
      this.filtrarUsuarios();
    });
  }

  filtrarUsuarios() {
    if (this.filtroRol === 'todos') {
      this.usuariosFiltrados = this.usuarios;
    } else {
      this.usuariosFiltrados = this.usuarios.filter(
        u => u.rol?.nombre?.toLowerCase() === this.filtroRol
      );
    }
  }

  onFiltroRolChange() {
    this.filtrarUsuarios();
  }

  crearUsuario() {
    if (this.usuarioForm.invalid) return;
    this.creando = true;
    this.http.post('http://localhost:3000/usuarios', this.usuarioForm.value).subscribe({
      next: () => {
        this.usuarioForm.reset();
        this.cargarUsuarios();
        this.creando = false;
        this.showForm = false;
      },
      error: () => {
        this.creando = false;
      }
    });
  }

  mostrarFormulario() {
    this.showForm = true;
  }

  cancelarFormulario() {
    this.showForm = false;
    this.usuarioForm.reset();
  }

  verUsuario(usuario: any) {
    this.usuarioSeleccionado = usuario;
    this.showModalVer = true;
  }

  cerrarModalVer() {
    this.showModalVer = false;
    this.usuarioSeleccionado = null;
  }
}