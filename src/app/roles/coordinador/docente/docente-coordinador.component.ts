import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { limpiarLineasCSV, extraerEncabezados, procesarFilas, transformarAFilaDocente } from '../../../../utils/excel-utils';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-docente-coordinador',
  standalone: true,
  templateUrl: './docente-coordinador.component.html',
  styleUrls: ['./docente-coordinador.component.scss'],
  imports: [HeaderComponent, CommonModule, FormsModule]
})
export class DocenteCoordinadorComponent implements OnInit {
  contratos: any[] = [];
  nivelesIngles: any[] = [];
  especializaciones: any[] = [];
  horariosDisponibles: any[] = [];

  docentes: any[] = [];
  docentesFiltrados: any[] = [];
  docentesInactivos: any[] = [];
  docentesInactivosFiltrados: any[] = [];
  mostrarInactivos: boolean = false;


  mostrarModal: boolean = false;
  mostrarModalVista: boolean = false;
  textoBusqueda: string = '';
  filtroContrato: string = 'Todos';
  filtroNivelIngles: string = 'Todos';
  filtroExperiencia: number = 0;

  docenteSeleccionado: any = null;
  
  // Variables para paginación
  docentesPorPagina: number = 10;
  paginaActual: number = 1;
  totalPaginas: number = 1;
  docentesPaginados: any[] = [];

  constructor(private http: HttpClient, private router: Router, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarCatalogos().then(() => {
      this.cargarDocentes();
    });
  }



  cargarCatalogos(): Promise<void> {
    return new Promise((resolve) => {
      let catalogosCargados = 0;
      const totalCatalogos = 4;

      const verificarCompletado = () => {
        catalogosCargados++;
        if (catalogosCargados === totalCatalogos) {
          console.log('✅ Todos los catálogos cargados');
          resolve();
        }
      };

      this.http.get<any[]>('http://localhost:3000/catalogos/tipos-contrato').subscribe({
        next: (data) => {
          this.contratos = data;
          console.log('📋 Contratos cargados:', data.length);
          verificarCompletado();
        },
        error: (err) => {
          console.error('❌ Error cargando contratos:', err);
          verificarCompletado();
        }
      });

      this.http.get<any[]>('http://localhost:3000/catalogos/niveles-ingles').subscribe({
        next: (data) => {
          this.nivelesIngles = data;
          console.log('📋 Niveles de inglés cargados:', data.length);
          verificarCompletado();
        },
        error: (err) => {
          console.error('❌ Error cargando niveles de inglés:', err);
          verificarCompletado();
        }
      });

      this.http.get<any[]>('http://localhost:3000/catalogos/especializaciones').subscribe({
        next: (data) => {
          this.especializaciones = data;
          console.log('📋 Especializaciones cargadas:', data.length);
          verificarCompletado();
        },
        error: (err) => {
          console.error('❌ Error cargando especializaciones:', err);
          verificarCompletado();
        }
      });

      this.http.get<any[]>('http://localhost:3000/catalogos/horarios').subscribe({
        next: (data) => {
          this.horariosDisponibles = data;
          console.log('📋 Horarios cargados:', data.length);
          verificarCompletado();
        },
        error: (err) => {
          console.error('❌ Error cargando horarios:', err);
          verificarCompletado();
        }
      });
    });
  }

  cargarDocentes() {
    console.log('📥 Cargando docentes desde la API...');
    this.http.get<any[]>('http://localhost:3000/docentes').subscribe(data => {
      console.log('📦 Datos recibidos de la API:', data.length, 'docentes');
      this.docentes = data;
      this.filtrarDocentes();
    });
  }

  cargarDocentesInactivos() {
    console.log('📥 Cargando docentes inactivos desde la API...');
    this.http.get<any[]>('http://localhost:3000/docentes/inactivos').subscribe(data => {
      console.log('📦 Datos recibidos de la API (inactivos):', data.length, 'docentes');
      this.docentesInactivos = data;
      this.filtrarDocentesInactivos();
    });
  }

  // === FILTRADO Y PAGINACIÓN ===
  filtrarDocentes(): void {
    console.log('🔍 Filtrando docentes activos...');
    console.log('📋 Total docentes activos:', this.docentes.length);
    
    this.docentesFiltrados = this.docentes.filter(docente => {
      return this.filtrarPorContrato(docente) &&
        this.filtrarPorNivel(docente) &&
        this.filtrarPorExperiencia(docente) &&
        this.filtrarPorBusqueda(docente);
    });
    
    console.log('✅ Docentes activos filtrados:', this.docentesFiltrados.length);
    this.aplicarPaginacion();
  }

  filtrarDocentesInactivos(): void {
    console.log('🔍 Filtrando docentes inactivos...');
    console.log('📋 Total docentes inactivos:', this.docentesInactivos.length);
    
    this.docentesInactivosFiltrados = this.docentesInactivos.filter(docente => {
      return this.filtrarPorContrato(docente) &&
        this.filtrarPorNivel(docente) &&
        this.filtrarPorExperiencia(docente) &&
        this.filtrarPorBusqueda(docente);
    });
    
    console.log('✅ Docentes inactivos filtrados:', this.docentesInactivosFiltrados.length);
    this.aplicarPaginacionInactivos();
  }

  filtrarSegunVista(): void {
    if (this.mostrarInactivos) {
      this.filtrarDocentesInactivos();
    } else {
      this.filtrarDocentes();
    }
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

  filtrarPorContrato(docente: any): boolean {
    return this.filtroContrato === 'Todos' || docente.tipo_contrato?.nombre === this.filtroContrato;
  }

  filtrarPorNivel(docente: any): boolean {
    return this.filtroNivelIngles === 'Todos' || docente.nivel_ingles?.nombre === this.filtroNivelIngles;
  }

  filtrarPorExperiencia(docente: any): boolean {
    const experienciaMinima = Math.max(0, this.filtroExperiencia);
    if (experienciaMinima === 0) return true;
    const experienciaDocente = docente.experiencia_anios || 0;
    return experienciaDocente >= experienciaMinima;
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

  obtenerRangoPagina(): { inicio: number, fin: number, total: number } {
    const inicio = (this.paginaActual - 1) * this.docentesPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.docentesPorPagina, this.mostrarInactivos ? this.docentesInactivosFiltrados.length : this.docentesFiltrados.length);
    const total = this.mostrarInactivos ? this.docentesInactivosFiltrados.length : this.docentesFiltrados.length;
    return { inicio, fin, total };
  }

  obtenerPaginasVisibles(): number[] {
    const paginas: number[] = [];
    const maxPaginas = 5;
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
    
    if (fin - inicio + 1 < maxPaginas) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  // === VISTA ACTIVOS/INACTIVOS ===
  cambiarAVistaActivos() {
    this.mostrarInactivos = false;
    this.paginaActual = 1;
    this.filtrarDocentes();
  }

  cambiarAVistaInactivos() {
    this.mostrarInactivos = true;
    this.paginaActual = 1;
    if (this.docentesInactivos.length === 0) {
      this.cargarDocentesInactivos();
    } else {
      this.filtrarDocentesInactivos();
    }
  }

  resetearFiltros() {
    this.textoBusqueda = '';
    this.filtroContrato = 'Todos';
    this.filtroNivelIngles = 'Todos';
    this.filtroExperiencia = 0;
    this.filtrarSegunVista();
  }

  // === VER DOCENTE ===
  verDocente(index: number) {
    console.log('🔍 Ver docente - Índice:', index);
    console.log('🔍 Total docentes paginados:', this.docentesPaginados.length);
    
    // Limpiar docente anterior si existe
    if (this.docenteSeleccionado) {
      console.log('🧹 Limpiando docente anterior:', this.docenteSeleccionado.persona?.primer_nombre);
      this.docenteSeleccionado = null;
    }
    
    // Usar la lista paginada para obtener el docente correcto
    const docente = this.docentesPaginados[index];
    
    if (docente) {
      console.log('✅ Docente encontrado:', {
        nombre: `${docente.persona?.primer_nombre} ${docente.persona?.primer_apellido}`,
        cedula: docente.persona?.cedula,
        correo: docente.persona?.correo
      });
    } else {
      console.error('❌ No se encontró docente en el índice:', index);
    }
    
    this.docenteSeleccionado = docente;
    this.mostrarModalVista = true;
    
    // Debug: Verificar estructura de especializaciones
    if (docente && docente.especializaciones) {
      console.log('🔍 Estructura de especializaciones para', docente.persona?.primer_nombre, ':', docente.especializaciones);
      docente.especializaciones.forEach((esp: any, index: number) => {
        console.log(`  ${index}:`, esp);
      });
    }
    
    this.cdr.detectChanges();
  }

  cerrarModalVista() {
    console.log('🔒 Cerrando modal, limpiando docente seleccionado');
    this.mostrarModalVista = false;
    this.docenteSeleccionado = null;
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    
    if (timeString.includes(':')) {
      return timeString.substring(0, 5);
    }
    
    return timeString;
  }

  // Método para verificar si un docente tiene una especialización específica
  tieneEspecializacion(docente: any, especializacionId: number): boolean {
    if (!docente) {
      console.log('❌ No hay docente para verificar especialización');
      return false;
    }
    
    if (!docente.especializaciones || !Array.isArray(docente.especializaciones)) {
      console.log('❌ Docente no tiene especializaciones o no es un array:', docente.persona?.primer_nombre);
      return false;
    }
    
    // Buscar la especialización por ID en el catálogo
    const especializacionCatalogo = this.especializaciones.find(esp => esp.id === especializacionId);
    if (!especializacionCatalogo) {
      console.log('❌ No se encontró especialización en catálogo con ID:', especializacionId);
      return false;
    }
    
    console.log('🔍 Verificando especialización:', especializacionCatalogo.nombre, 'ID:', especializacionId, 'para docente:', docente.persona?.primer_nombre);
    console.log('🔍 Especializaciones del docente:', docente.especializaciones);
    
    const tieneEspecializacion = docente.especializaciones.some((e: any) => {
      // Comparar por ID
      const matchById = e.especializacion?.id === especializacionId;
      // Comparar por nombre como respaldo
      const matchByName = e.especializacion?.nombre?.toLowerCase() === especializacionCatalogo.nombre?.toLowerCase();
      
      if (matchById || matchByName) {
        console.log('✅ Encontrada especialización:', e.especializacion?.nombre, 'ID:', e.especializacion?.id);
        return true;
      }
      return false;
    });
    
    console.log('🎯 Resultado para', especializacionCatalogo.nombre, 'ID', especializacionId, ':', tieneEspecializacion);
    return tieneEspecializacion;
  }
}
