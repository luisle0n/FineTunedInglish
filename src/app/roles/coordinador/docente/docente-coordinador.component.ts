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
          resolve();
        }
      };

      this.http.get<any[]>('http://localhost:3000/catalogos/tipos-contrato').subscribe({
        next: (data) => {
          this.contratos = data;
          verificarCompletado();
        },
        error: (err) => {
          verificarCompletado();
        }
      });

      this.http.get<any[]>('http://localhost:3000/catalogos/niveles-ingles').subscribe({
        next: (data) => {
          this.nivelesIngles = data;
          verificarCompletado();
        },
        error: (err) => {
          verificarCompletado();
        }
      });

      this.http.get<any[]>('http://localhost:3000/catalogos/especializaciones').subscribe({
        next: (data) => {
          this.especializaciones = data;
          verificarCompletado();
        },
        error: (err) => {
          verificarCompletado();
        }
      });

      this.http.get<any[]>('http://localhost:3000/catalogos/horarios').subscribe({
        next: (data) => {
          this.horariosDisponibles = data;
          verificarCompletado();
        },
        error: (err) => {
          verificarCompletado();
        }
      });
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

  // === FILTRADO Y PAGINACIÓN ===
  filtrarDocentes(): void {
    
    this.docentesFiltrados = this.docentes.filter(docente => {
      return this.filtrarPorContrato(docente) &&
        this.filtrarPorNivel(docente) &&
        this.filtrarPorExperiencia(docente) &&
        this.filtrarPorBusqueda(docente);
    });
    
    this.aplicarPaginacion();
  }

  filtrarDocentesInactivos(): void {
    
    this.docentesInactivosFiltrados = this.docentesInactivos.filter(docente => {
      return this.filtrarPorContrato(docente) &&
        this.filtrarPorNivel(docente) &&
        this.filtrarPorExperiencia(docente) &&
        this.filtrarPorBusqueda(docente);
    });
    
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
    
    // Limpiar docente anterior si existe
    if (this.docenteSeleccionado) {
      this.docenteSeleccionado = null;
    }
    
    // Usar la lista paginada para obtener el docente correcto
    const docente = this.docentesPaginados[index];
    
    if (docente) {
    } else {
    }
    
    this.docenteSeleccionado = docente;
    this.mostrarModalVista = true;
    
    // Debug: Verificar estructura de especializaciones
    if (docente && docente.especializaciones) {
      docente.especializaciones.forEach((esp: any, index: number) => {
      });
    }
    
    this.cdr.detectChanges();
  }

  cerrarModalVista() {
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
      return false;
    }
    
    if (!docente.especializaciones || !Array.isArray(docente.especializaciones)) {
      return false;
    }
    
    // Buscar la especialización por ID en el catálogo
    const especializacionCatalogo = this.especializaciones.find(esp => esp.id === especializacionId);
    if (!especializacionCatalogo) {
      return false;
    }
    
    const tieneEspecializacion = docente.especializaciones.some((e: any) => {
      // Comparar por ID
      const matchById = e.especializacion?.id === especializacionId;
      // Comparar por nombre como respaldo
      const matchByName = e.especializacion?.nombre?.toLowerCase() === especializacionCatalogo.nombre?.toLowerCase();
      
      if (matchById || matchByName) {
        return true;
      }
      return false;
    });
    
    return tieneEspecializacion;
  }
}
