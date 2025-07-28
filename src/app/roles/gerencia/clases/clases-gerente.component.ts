import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-clases-gerente',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './clases-gerente.component.html',
  styleUrls: ['./clases-gerente.component.scss']
})
export class ClasesGerenteComponent implements OnInit {
  clases: any[] = [];
  clasesFiltradas: any[] = [];
  cargando = true;
  error = false;

  textoBusqueda: string = '';
  filtroEstado: string = 'Todos';
  filtroCategoria: string = 'Todos';
  filtroPrioridadMin: number = 0;
  filtroPrioridadMax: number = 10;

  clasesPorPagina: number = 10;
  paginaActual: number = 1;
  totalPaginas: number = 1;
  clasesPaginadas: any[] = [];

  mostrarModalVista: boolean = false;
  claseSeleccionada: any = null;

  categorias: string[] = [];
  estados: string[] = ['PENDIENTE', 'ASIGNADO', 'CANCELADO'];

  constructor() { }

  ngOnInit(): void {
    this.cargarClases();
  }

  cargarClases() {
    this.cargando = true;
    this.error = false;
    fetch('http://localhost:3000/clases')
      .then(res => res.json())
      .then(response => {
        if (response.success && response.clases) {
          this.clases = response.clases;
          this.extraerCategorias();
          this.filtrarClases();
        } else {
          this.error = true;
        }
        this.cargando = false;
      })
      .catch(() => {
        this.error = true;
        this.cargando = false;
      });
  }

  extraerCategorias() {
    const categoriasUnicas = new Set<string>();
    this.clases.forEach(clase => {
      if (clase.programa && clase.programa.categoria) {
        categoriasUnicas.add(clase.programa.categoria);
      }
    });
    this.categorias = Array.from(categoriasUnicas).sort();
  }

  filtrarClases(): void {
    this.clasesFiltradas = this.clases.filter(clase => {
      return this.filtrarPorBusqueda(clase) &&
        this.filtrarPorEstado(clase) &&
        this.filtrarPorCategoria(clase) &&
        this.filtrarPorPrioridad(clase);
    });
    this.aplicarPaginacion();
  }

  filtrarPorBusqueda(clase: any): boolean {
    const texto = this.textoBusqueda.trim().toLowerCase();
    if (!texto) return true;
    const programaNombre = clase.programa?.nombre?.toLowerCase() || '';
    const programaCategoria = clase.programa?.categoria?.toLowerCase() || '';
    const paralelo = clase.paralelo?.toLowerCase() || '';
    const horario = clase.horario_solicitado?.toLowerCase() || '';
    const observaciones = clase.observaciones?.toLowerCase() || '';
    return programaNombre.includes(texto) || 
           programaCategoria.includes(texto) || 
           paralelo.includes(texto) ||
           horario.includes(texto) ||
           observaciones.includes(texto);
  }

  filtrarPorEstado(clase: any): boolean {
    return this.filtroEstado === 'Todos' || clase.estado === this.filtroEstado;
  }

  filtrarPorCategoria(clase: any): boolean {
    return this.filtroCategoria === 'Todos' || clase.programa?.categoria === this.filtroCategoria;
  }

  filtrarPorPrioridad(clase: any): boolean {
    const prioridad = clase.prioridad || 0;
    return prioridad >= this.filtroPrioridadMin && prioridad <= this.filtroPrioridadMax;
  }

  validarPrioridad(event: any, tipo: 'min' | 'max'): void {
    const valor = event.target.value;
    const numero = Number(valor);
    if (tipo === 'min') {
      if (numero < 0) {
        this.filtroPrioridadMin = 0;
        event.target.value = '0';
      } else {
        this.filtroPrioridadMin = numero;
      }
    } else {
      if (numero < 0) {
        this.filtroPrioridadMax = 10;
        event.target.value = '10';
      } else {
        this.filtroPrioridadMax = numero;
      }
    }
    this.filtrarClases();
  }

  aplicarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.clasesPorPagina;
    const fin = inicio + this.clasesPorPagina;
    this.clasesPaginadas = this.clasesFiltradas.slice(inicio, fin);
    this.totalPaginas = Math.ceil(this.clasesFiltradas.length / this.clasesPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.aplicarPaginacion();
    }
  }

  obtenerRangoPagina(): { inicio: number, fin: number, total: number } {
    const inicio = (this.paginaActual - 1) * this.clasesPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.clasesPorPagina, this.clasesFiltradas.length);
    return { inicio, fin, total: this.clasesFiltradas.length };
  }

  obtenerPaginasVisibles(): number[] {
    const paginas: number[] = [];
    const maxPaginas = 5;
    if (this.totalPaginas <= maxPaginas) {
      for (let i = 1; i <= this.totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      let inicio = Math.max(1, this.paginaActual - 2);
      let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
      if (fin - inicio < maxPaginas - 1) {
        inicio = Math.max(1, fin - maxPaginas + 1);
      }
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }
    }
    return paginas;
  }

  resetearFiltros(): void {
    this.textoBusqueda = '';
    this.filtroEstado = 'Todos';
    this.filtroCategoria = 'Todos';
    this.filtroPrioridadMin = 0;
    this.filtroPrioridadMax = 10;
    this.paginaActual = 1;
    this.filtrarClases();
  }

  get totalClases(): number {
    return this.clases.length;
  }
  get clasesPendientes(): number {
    return this.clases.filter(c => c.estado === 'PENDIENTE').length;
  }
  get clasesAsignadas(): number {
    return this.clases.filter(c => c.estado === 'ASIGNADO').length;
  }
  get clasesCanceladas(): number {
    return this.clases.filter(c => c.estado === 'CANCELADO').length;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'estado-pendiente';
      case 'ASIGNADO':
        return 'estado-asignado';
      case 'CANCELADO':
        return 'estado-cancelado';
      default:
        return 'estado-regular';
    }
  }
  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return '\u23f3 Pendiente';
      case 'ASIGNADO':
        return '\u2705 Asignado';
      case 'CANCELADO':
        return '\u274c Cancelado';
      default:
        return estado;
    }
  }
  getCategoriaClass(categoria: string): string {
    switch (categoria) {
      case 'Tiny Kids':
        return 'categoria-tiny-kids';
      case 'Children':
        return 'categoria-children';
      case 'Teens':
        return 'categoria-teens';
      case 'Youth':
        return 'categoria-youth';
      case 'Adults':
        return 'categoria-adults';
      default:
        return 'categoria-regular';
    }
  }
  getPrioridadClass(prioridad: number): string {
    if (prioridad >= 8) return 'prioridad-alta';
    if (prioridad >= 5) return 'prioridad-media';
    return 'prioridad-baja';
  }
  verClase(index: number): void {
    this.claseSeleccionada = this.clasesPaginadas[index];
    this.mostrarModalVista = true;
  }
  cerrarModalVista(): void {
    this.mostrarModalVista = false;
    this.claseSeleccionada = null;
  }
} 