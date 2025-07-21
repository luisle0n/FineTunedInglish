import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-aulas-talento-humano',
  standalone: true,
  imports: [HeaderComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './aulas-talento-humano.component.html',
  styleUrls: ['./aulas-talento-humano.component.scss']
})
export class AulasTalentoHumanoComponent implements OnInit {

  aulas: any[] = [];
  aulasFiltradas: any[] = [];
  cargando = true;
  error = false;

  // Variables para filtros
  textoBusqueda: string = '';
  filtroPiso: string = 'Todos';
  filtroTipo: string = 'Todos';
  filtroEstado: string = 'Todos';
  filtroCapacidad: number = 0;

  // Variables para paginación
  aulasPorPagina: number = 10;
  paginaActual: number = 1;
  totalPaginas: number = 1;
  aulasPaginadas: any[] = [];

  // Variables para modal
  mostrarModalVista: boolean = false;
  aulaSeleccionada: any = null;

  // Vista de aulas eliminadas
  mostrarAulasEliminadas: boolean = false;
  aulasEliminadas: any[] = [];
  cargandoEliminadas: boolean = false;
  errorEliminadas: boolean = false;

  // Listas para filtros
  pisos: string[] = [];
  tipos: string[] = ['tiny_kids', 'children', 'teens', 'adults'];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    console.log('🎓 Componente Vista Aulas - Talento Humano cargado');
    this.cargarAulas();
    this.cargarAulasEliminadas(); // Cargar también las aulas inactivas para las estadísticas
  }

  cargarAulas() {
    console.log('🚀 === CARGANDO AULAS DESDE SERVIDOR ===');
    this.cargando = true;
    this.error = false;
    
    console.log('🚀 Haciendo petición GET a: http://localhost:3000/aulas');
    
    this.http.get('http://localhost:3000/aulas').subscribe({
      next: (response: any) => {
        console.log('📦 === RESPUESTA DEL SERVIDOR ===');
        console.log('📦 Datos de aulas recibidos:', response);
        
        if (response.success && response.aulas) {
          this.aulas = response.aulas;
          console.log('📦 Aulas cargadas del servidor:', this.aulas.length);
          
          // Debugging para aulas inactivas
          const aulasInactivas = this.aulas.filter(a => a.estado === false);
          console.log('🔧 Aulas inactivas en servidor:', aulasInactivas.length);
          console.log('🔧 Detalle de aulas inactivas:', aulasInactivas.map(a => ({
            id: a.id,
            numero: a.numero,
            estado: a.estado,
            disponible: a.disponible
          })));
          
          this.extraerPisos();
          this.filtrarAulas();
          this.actualizarEstadisticas();
          
          console.log('📊 Estadísticas actualizadas después de cargar aulas activas');
        } else {
          console.error('❌ Respuesta inesperada del servidor:', response);
          this.error = true;
        }
        
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ === ERROR CARGANDO AULAS ===');
        console.error('❌ Error cargando aulas:', err);
        this.error = true;
        this.cargando = false;
      }
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

  // === FILTRADO Y PAGINACIÓN ===
  filtrarAulas(): void {
    console.log('🔍 Filtrando aulas...');
    console.log('📋 Total aulas:', this.aulas.length);
    
    this.aulasFiltradas = this.aulas.filter(aula => {
      return this.filtrarPorBusqueda(aula) &&
        this.filtrarPorPiso(aula) &&
        this.filtrarPorTipo(aula) &&
        this.filtrarPorEstado(aula) &&
        this.filtrarPorCapacidad(aula);
    });
    
    console.log('✅ Aulas filtradas:', this.aulasFiltradas.length);
    this.aplicarPaginacion();
  }

  filtrarPorBusqueda(aula: any): boolean {
    const texto = this.textoBusqueda.trim().toLowerCase();
    if (!texto) return true;
    
    const numeroAula = aula.numero?.toString().toLowerCase() || '';
    const piso = aula.piso?.toLowerCase() || '';
    const ubicacion = aula.ubicacion?.toLowerCase() || '';
    const observaciones = aula.observaciones?.toLowerCase() || '';
    
    return numeroAula.includes(texto) || 
           piso.includes(texto) || 
           ubicacion.includes(texto) ||
           observaciones.includes(texto);
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

  validarCapacidadMinima(event: any): void {
    const valor = event.target.value;
    const numero = Number(valor);
    
    // Si el valor es negativo, establecerlo en 0
    if (numero < 0) {
      this.filtroCapacidad = 0;
      event.target.value = '0';
    } else {
      this.filtroCapacidad = numero;
    }
    
    // Aplicar filtros después de la validación
    this.filtrarAulas();
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

  // Propiedades computadas para las estadísticas
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
    // Las aulas inactivas están en la lista de aulasEliminadas
    const totalInactivas = this.aulasEliminadas.length;
    
    console.log('🔧 === DEBUGGING AULAS INACTIVAS ===');
    console.log('🔧 Total aulas activas:', this.aulas.length);
    console.log('🔧 Total aulas eliminadas/inactivas:', this.aulasEliminadas.length);
    console.log('🔧 Detalle de aulas inactivas:', this.aulasEliminadas.map(a => ({
      id: a.id,
      numero: a.numero,
      estado: a.estado,
      tipoEstado: typeof a.estado,
      disponible: a.disponible
    })));
    
    return totalInactivas;
  }

  getEstadoClass(disponible: boolean, estado: boolean): string {
    if (!estado) {
      return 'estado-mantenimiento';
    }
    return disponible ? 'estado-disponible' : 'estado-ocupada';
  }

  getEstadoTexto(disponible: boolean, estado: boolean): string {
    if (!estado) {
      return 'Mantenimiento';
    }
    return disponible ? 'Disponible' : 'Ocupada';
  }

  getTipoAula(tipoAula: string): string {
    switch (tipoAula) {
      case 'tiny_kids':
        return 'Tiny Kids';
      case 'children':
        return 'Children';
      case 'teens':
        return 'Teens';
      case 'adults':
        return 'Adults';
      default:
        return tipoAula;
    }
  }

  getTipoClass(tipoAula: string): string {
    switch (tipoAula) {
      case 'tiny_kids':
        return 'tipo-tiny-kids';
      case 'children':
        return 'tipo-children';
      case 'teens':
        return 'tipo-teens';
      case 'adults':
        return 'tipo-adults';
      default:
        return 'tipo-regular';
    }
  }

  getRangoEdad(aula: any): string {
    if (aula.edad_minima && aula.edad_maxima) {
      return `${aula.edad_minima} - ${aula.edad_maxima} años`;
    }
    return 'No especificado';
  }

  verAula(index: number): void {
    console.log('👁️ Viendo aula en índice:', index);
    this.aulaSeleccionada = this.aulasPaginadas[index];
    this.mostrarModalVista = true;
  }

  cerrarModalVista(): void {
    this.mostrarModalVista = false;
    this.aulaSeleccionada = null;
  }

  // === MÉTODOS PARA AULAS ELIMINADAS ===
  cargarAulasEliminadas() {
    console.log('🚀 === CARGANDO AULAS ELIMINADAS ===');
    this.cargandoEliminadas = true;
    this.errorEliminadas = false;
    
    console.log('🚀 Haciendo petición GET a: http://localhost:3000/aulas/eliminadas');
    
    this.http.get('http://localhost:3000/aulas/eliminadas').subscribe({
      next: (response: any) => {
        console.log('📦 === RESPUESTA AULAS ELIMINADAS ===');
        console.log('📦 Datos de aulas eliminadas recibidos:', response);
        
        if (response.success && response.aulas) {
          this.aulasEliminadas = response.aulas;
          console.log('📦 Aulas eliminadas cargadas:', this.aulasEliminadas.length);
          
          // Actualizar estadísticas después de cargar aulas eliminadas
          this.actualizarEstadisticas();
          console.log('📊 Estadísticas actualizadas después de cargar aulas eliminadas');
        } else {
          console.error('❌ Respuesta inesperada del servidor:', response);
          this.errorEliminadas = true;
        }
        
        this.cargandoEliminadas = false;
      },
      error: (err) => {
        console.error('❌ === ERROR CARGANDO AULAS ELIMINADAS ===');
        console.error('❌ Error cargando aulas eliminadas:', err);
        this.errorEliminadas = true;
        this.cargandoEliminadas = false;
      }
    });
  }

  cambiarVistaAulas() {
    this.mostrarAulasEliminadas = !this.mostrarAulasEliminadas;
    
    if (this.mostrarAulasEliminadas) {
      this.cargarAulasEliminadas();
    } else {
      this.cargarAulas(); // Recargar aulas activas
    }
    
    // Limpiar filtros al cambiar vista
    this.resetearFiltros();
  }

  verAulaEliminada(index: number): void {
    console.log('👁️ Viendo aula eliminada en índice:', index);
    this.aulaSeleccionada = this.aulasEliminadas[index];
    this.mostrarModalVista = true;
  }

  actualizarEstadisticas(): void {
    console.log('🔄 === ACTUALIZANDO ESTADÍSTICAS ===');
    console.log('📊 Total aulas activas:', this.aulas.length);
    console.log('📊 Total aulas inactivas:', this.aulasEliminadas.length);
    console.log('📊 Aulas disponibles:', this.aulas.filter(a => a.disponible === true).length);
    console.log('📊 Aulas ocupadas:', this.aulas.filter(a => a.disponible === false).length);
    
    // Detalles de aulas activas por disponibilidad
    const aulasDisponibles = this.aulas.filter(a => a.disponible === true);
    const aulasOcupadas = this.aulas.filter(a => a.disponible === false);
    
    console.log('📋 Detalle aulas disponibles:', aulasDisponibles.map(a => a.numero));
    console.log('📋 Detalle aulas ocupadas:', aulasOcupadas.map(a => a.numero));
    
    // Forzar la detección de cambios en Angular
    // Esto asegura que las propiedades computadas se actualicen en la UI
    setTimeout(() => {
      console.log('🔄 Forzando actualización de UI...');
      // Angular debería detectar automáticamente los cambios, pero el setTimeout ayuda
    }, 100);
  }
} 