import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-docente-gerente',
  standalone: true,
  templateUrl: './docente-gerente.component.html',
  styleUrls: ['./docente-gerente.component.scss'],
  imports: [CommonModule, FormsModule, HeaderComponent]
})
export class DocenteGerenteComponent implements OnInit {
  contratos: any[] = [];
  nivelesIngles: any[] = [];
  docentes: any[] = [];
  docentesFiltrados: any[] = [];
  docentesInactivos: any[] = [];
  docentesInactivosFiltrados: any[] = [];
  mostrarInactivos: boolean = false;
  mostrarModalVista: boolean = false;
  textoBusqueda: string = '';
  filtroContrato: string = 'Todos';
  filtroNivelIngles: string = 'Todos';
  filtroExperiencia: number = 0;
  docenteSeleccionado: any = null;
  docentesPorPagina: number = 10;
  paginaActual: number = 1;
  totalPaginas: number = 1;
  docentesPaginados: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarDocentes();
    this.cargarDocentesInactivos();
  }

  cargarCatalogos() {
    this.http.get<any[]>('http://localhost:3000/catalogos/tipos-contrato').subscribe({
      next: (data) => this.contratos = data
    });
    this.http.get<any[]>('http://localhost:3000/catalogos/niveles-ingles').subscribe({
      next: (data) => this.nivelesIngles = data
    });
  }

  cargarDocentes() {
    this.http.get<any[]>('http://localhost:3000/docentes').subscribe(data => {
      this.docentes = data;
      this.filtrarDocentes();
    });
  }

  cargarDocentesInactivos() {
    this.http.get<any[]>('http://localhost:3000/docentes/inactivos').subscribe(data => {
      this.docentesInactivos = data;
      this.filtrarDocentesInactivos();
    });
  }

  filtrarDocentes(): void {
    this.docentesFiltrados = this.docentes.filter(docente =>
      this.filtrarPorContrato(docente) &&
      this.filtrarPorNivel(docente) &&
      this.filtrarPorExperiencia(docente) &&
      this.filtrarPorBusqueda(docente)
    );
    this.paginaActual = 1;
    this.aplicarPaginacion();
  }

  filtrarDocentesInactivos(): void {
    this.docentesInactivosFiltrados = this.docentesInactivos.filter(docente =>
      this.filtrarPorContrato(docente) &&
      this.filtrarPorNivel(docente) &&
      this.filtrarPorExperiencia(docente) &&
      this.filtrarPorBusqueda(docente)
    );
    this.paginaActual = 1;
    this.aplicarPaginacionInactivos();
  }

  filtrarPorContrato(docente: any): boolean {
    return this.filtroContrato === 'Todos' || docente.tipo_contrato?.nombre === this.filtroContrato;
  }

  filtrarPorNivel(docente: any): boolean {
    return this.filtroNivelIngles === 'Todos' || docente.nivel_ingles?.nombre === this.filtroNivelIngles;
  }

  filtrarPorExperiencia(docente: any): boolean {
    return !this.filtroExperiencia || docente.experiencia_anios >= this.filtroExperiencia;
  }

  filtrarPorBusqueda(docente: any): boolean {
    const texto = this.textoBusqueda.trim().toLowerCase();
    const nombres = [
      docente.persona?.primer_nombre || '',
      docente.persona?.segundo_nombre || '',
      docente.persona?.primer_apellido || '',
      docente.persona?.segundo_apellido || ''
    ].join(' ').toLowerCase();
    return nombres.includes(texto);
  }

  aplicarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.docentesPorPagina;
    const fin = inicio + this.docentesPorPagina;
    this.docentesPaginados = this.docentesFiltrados.slice(inicio, fin);
    this.totalPaginas = Math.ceil(this.docentesFiltrados.length / this.docentesPorPagina);
  }

  aplicarPaginacionInactivos(): void {
    const inicio = (this.paginaActual - 1) * this.docentesPorPagina;
    const fin = inicio + this.docentesPorPagina;
    this.docentesPaginados = this.docentesInactivosFiltrados.slice(inicio, fin);
    this.totalPaginas = Math.ceil(this.docentesInactivosFiltrados.length / this.docentesPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      if (this.mostrarInactivos) {
        this.aplicarPaginacionInactivos();
      } else {
        this.aplicarPaginacion();
      }
    }
  }

  obtenerRangoPagina() {
    const total = this.mostrarInactivos ? this.docentesInactivosFiltrados.length : this.docentesFiltrados.length;
    const inicio = (this.paginaActual - 1) * this.docentesPorPagina + 1;
    const fin = Math.min(inicio + this.docentesPorPagina - 1, total);
    return { inicio, fin, total };
  }

  obtenerPaginasVisibles(): number[] {
    const paginas: number[] = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  cambiarAVistaActivos() {
    this.mostrarInactivos = false;
    this.filtrarDocentes();
  }

  cambiarAVistaInactivos() {
    this.mostrarInactivos = true;
    this.filtrarDocentesInactivos();
  }

  verDocente(index: number) {
    this.docenteSeleccionado = this.docentesPaginados[index];
    this.mostrarModalVista = true;
    this.cdr.detectChanges();
  }

  cerrarModalVista() {
    this.mostrarModalVista = false;
    this.docenteSeleccionado = null;
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
  }

  filtrarSegunVista() {
    if (this.mostrarInactivos) {
      this.filtrarDocentesInactivos();
    } else {
      this.filtrarDocentes();
    }
  }

  resetearFiltros() {
    this.filtroContrato = 'Todos';
    this.filtroNivelIngles = 'Todos';
    this.filtroExperiencia = 0;
    this.textoBusqueda = '';
    this.filtrarSegunVista();
  }
} 