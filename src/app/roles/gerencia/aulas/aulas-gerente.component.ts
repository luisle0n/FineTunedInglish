import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-aulas-gerente',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './aulas-gerente.component.html',
  styleUrls: ['./aulas-gerente.component.scss']
})
export class AulasGerenteComponent implements OnInit {
  aulas: any[] = [];
  aulasFiltradas: any[] = [];
  cargando = true;
  error = false;

  textoBusqueda: string = '';
  filtroPiso: string = 'Todos';
  filtroTipo: string = 'Todos';
  filtroEstado: string = 'Todos';
  filtroCapacidad: number = 0;

  aulasPorPagina: number = 10;
  paginaActual: number = 1;
  totalPaginas: number = 1;
  aulasPaginadas: any[] = [];

  mostrarModalVista: boolean = false;
  aulaSeleccionada: any = null;

  mostrarAulasEliminadas: boolean = false;
  aulasEliminadas: any[] = [];
  cargandoEliminadas: boolean = false;
  errorEliminadas: boolean = false;

  pisos: string[] = [];
  tipos: string[] = ['tiny_kids', 'children', 'teens', 'adults'];

  constructor() { }

  ngOnInit(): void {
    this.cargarAulas();
    this.cargarAulasEliminadas();
  }

  cargarAulas() {
    this.cargando = true;
    this.error = false;
    fetch('http://localhost:3000/aulas')
      .then(res => res.json())
      .then(response => {
        if (response.success && response.aulas) {
          this.aulas = response.aulas;
          this.extraerPisos();
          this.filtrarAulas();
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

  extraerPisos() {
    const pisosUnicos = new Set<string>();
    this.aulas.forEach(aula => {
      if (aula.piso) {
        pisosUnicos.add(aula.piso);
      }
    });
    this.pisos = Array.from(pisosUnicos).sort();
  }

  filtrarAulas(): void {
    this.aulasFiltradas = this.aulas.filter(aula => {
      return this.filtrarPorBusqueda(aula) &&
        this.filtrarPorPiso(aula) &&
        this.filtrarPorTipo(aula) &&
        this.filtrarPorEstado(aula) &&
        this.filtrarPorCapacidad(aula);
    });
    this.paginaActual = 1;
    this.aplicarPaginacion();
  }

  filtrarPorBusqueda(aula: any): boolean {
    const texto = this.textoBusqueda.trim().toLowerCase();
    if (!texto) return true;
    const numeroAula = aula.numero?.toString().toLowerCase() || '';
    const piso = aula.piso?.toLowerCase() || '';
    const ubicacion = aula.ubicacion?.toLowerCase() || '';
    const observaciones = aula.observaciones?.toLowerCase() || '';
    return numeroAula.includes(texto) || piso.includes(texto) || ubicacion.includes(texto) || observaciones.includes(texto);
  }

  filtrarPorPiso(aula: any): boolean {
    return this.filtroPiso === 'Todos' || aula.piso === this.filtroPiso;
  }

  filtrarPorTipo(aula: any): boolean {
    if (this.filtroTipo === 'Todos') return true;
    return aula.tipo_aula === this.filtroTipo;
  }

  filtrarPorEstado(aula: any): boolean {
    if (this.filtroEstado === 'Todos') return true;
    if (this.filtroEstado === 'Disponible') {
      return aula.disponible === true && aula.estado === true;
    } else if (this.filtroEstado === 'Ocupada') {
      return aula.disponible === false && aula.estado === true;
    } else if (this.filtroEstado === 'Inactiva') {
      return aula.estado === false;
    }
    return true;
  }

  filtrarPorCapacidad(aula: any): boolean {
    const capacidadMinima = Math.max(0, this.filtroCapacidad);
    if (capacidadMinima === 0) return true;
    return (aula.capacidad || 0) >= capacidadMinima;
  }

  aplicarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.aulasPorPagina;
    const fin = inicio + this.aulasPorPagina;
    this.aulasPaginadas = this.aulasFiltradas.slice(inicio, fin);
    this.totalPaginas = Math.ceil(this.aulasFiltradas.length / this.aulasPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.aplicarPaginacion();
    }
  }

  obtenerRangoPagina(): { inicio: number, fin: number, total: number } {
    const inicio = (this.paginaActual - 1) * this.aulasPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.aulasPorPagina, this.aulasFiltradas.length);
    return { inicio, fin, total: this.aulasFiltradas.length };
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
    this.filtroPiso = 'Todos';
    this.filtroTipo = 'Todos';
    this.filtroEstado = 'Todos';
    this.filtroCapacidad = 0;
    this.paginaActual = 1;
    this.filtrarAulas();
  }

  // Estadísticas
  get totalAulas(): number {
    return this.aulas.length;
  }
  get aulasDisponibles(): number {
    return this.aulas.filter(a => a.disponible === true).length;
  }
  get aulasOcupadas(): number {
    return this.aulas.filter(a => a.disponible === false).length;
  }
  get aulasInactivas(): number {
    return this.aulasEliminadas.length;
  }

  getTipoAula(tipoAula: string): string {
    switch (tipoAula) {
      case 'tiny_kids': return 'Tiny Kids';
      case 'children': return 'Children';
      case 'teens': return 'Teens';
      case 'adults': return 'Adults';
      default: return tipoAula;
    }
  }
  getTipoClass(tipoAula: string): string {
    switch (tipoAula) {
      case 'tiny_kids': return 'tipo-tiny-kids';
      case 'children': return 'tipo-children';
      case 'teens': return 'tipo-teens';
      case 'adults': return 'tipo-adults';
      default: return 'tipo-regular';
    }
  }
  getRangoEdad(aula: any): string {
    if (aula.edad_minima && aula.edad_maxima) {
      return `${aula.edad_minima} - ${aula.edad_maxima} años`;
    }
    return 'No especificado';
  }

  // Modal de detalles
  verAula(index: number): void {
    this.aulaSeleccionada = this.aulasPaginadas[index];
    this.mostrarModalVista = true;
  }
  cerrarModalVista(): void {
    this.mostrarModalVista = false;
    this.aulaSeleccionada = null;
  }

  // Aulas eliminadas (solo visualización)
  cargarAulasEliminadas() {
    this.cargandoEliminadas = true;
    this.errorEliminadas = false;
    fetch('http://localhost:3000/aulas/eliminadas')
      .then(res => res.json())
      .then(response => {
        if (response.success && response.aulas) {
          this.aulasEliminadas = response.aulas;
        } else {
          this.errorEliminadas = true;
        }
        this.cargandoEliminadas = false;
      })
      .catch(() => {
        this.errorEliminadas = true;
        this.cargandoEliminadas = false;
      });
  }
  cambiarVistaAulas() {
    this.mostrarAulasEliminadas = !this.mostrarAulasEliminadas;
    if (this.mostrarAulasEliminadas) {
      this.cargarAulasEliminadas();
    } else {
      this.cargarAulas();
    }
    this.resetearFiltros();
  }
  verAulaEliminada(index: number): void {
    this.aulaSeleccionada = this.aulasEliminadas[index];
    this.mostrarModalVista = true;
  }
} 