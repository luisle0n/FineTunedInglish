import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-usuario-gerente',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './usuario-gerente.component.html',
  styleUrls: ['./usuario-gerente.component.scss']
})
export class UsuarioGerenteComponent implements OnInit {
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  filtroRol = 'todos';
  roles = [
    { value: 'todos', label: 'Todos' },
    { value: 'coordinador academico', label: 'Coordinador Académico' },
    { value: 'talento humano', label: 'Talento Humano' },
    { value: 'gerente', label: 'Gerente' }
  ];
  usuarioSeleccionado: any = null;
  showModalVer = false;

  constructor() { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    fetch('http://localhost:3000/usuarios')
      .then(res => res.json())
      .then(data => {
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

  verUsuario(usuario: any) {
    this.usuarioSeleccionado = usuario;
    this.showModalVer = true;
  }

  cerrarModalVer() {
    this.showModalVer = false;
    this.usuarioSeleccionado = null;
  }
} 