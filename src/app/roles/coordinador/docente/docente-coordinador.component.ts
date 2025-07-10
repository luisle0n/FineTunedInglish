import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-docente-coordinador',
  standalone: false,
  templateUrl: './docente-coordinador.component.html',
  styleUrls: ['./docente-coordinador.component.scss']
})
export class DocenteCoordinadorComponent implements OnInit {
  docentes: any[] = [];
  docentesFiltrados: any[] = [];

  textoBusqueda: string = '';
  mostrarModal: boolean = false;
  docenteSeleccionado: any = null;

  userMenuOpen: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarDocentes();
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  cerrarMenu() {
    this.userMenuOpen = false;
  }

  verPerfil() {
    console.log('Perfil del usuario');
  }

  cerrarSesion() {
    console.log('Cerrar sesión');
  }

  cargarDocentes() {
    this.http.get<any[]>('http://localhost:3000/docentes').subscribe(data => {
      this.docentes = data;
      this.docentesFiltrados = [...this.docentes];
    });
  }

  filtrarDocentes(): void {
    const texto = this.textoBusqueda.trim().toLowerCase();
    this.docentesFiltrados = this.docentes.filter(docente => {
      const nombres = [
        docente.persona?.primer_nombre || '',
        docente.persona?.segundo_nombre || '',
        docente.persona?.primer_apellido || '',
        docente.persona?.segundo_apellido || ''
      ].join(' ').toLowerCase();
      return nombres.includes(texto);
    });
  }

  abrirModalVer(docente: any) {
    this.docenteSeleccionado = docente;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.docenteSeleccionado = null;
  }
}
