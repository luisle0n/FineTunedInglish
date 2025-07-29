import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DocenteService, Docente } from '../../../services/docente.service';
import { limpiarLineasCSV, extraerEncabezados, procesarFilas, transformarAFilaDocente } from '../../../../utils/excel-utils';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Persona {
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  telefono?: string;
  cedula?: string;
  correo?: string;
}

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private docenteService: DocenteService,
    private cdr: ChangeDetectorRef
  ) {}

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

      this.docenteService.getTiposContrato().subscribe({
        next: (data) => {
          this.contratos = data;
          verificarCompletado();
        },
        error: (err) => {
          console.error('Error cargando tipos de contrato:', err);
          verificarCompletado();
        }
      });

      this.docenteService.getNivelesIngles().subscribe({
        next: (data) => {
          this.nivelesIngles = data;
          verificarCompletado();
        },
        error: (err) => {
          console.error('Error cargando niveles de inglés:', err);
          verificarCompletado();
        }
      });

      this.docenteService.getEspecializaciones().subscribe({
        next: (data) => {
          this.especializaciones = data;
          verificarCompletado();
        },
        error: (err) => {
          console.error('Error cargando especializaciones:', err);
          verificarCompletado();
        }
      });

      this.docenteService.getHorarios().subscribe({
        next: (data) => {
          this.horariosDisponibles = data;
          verificarCompletado();
        },
        error: (err) => {
          console.error('Error cargando horarios:', err);
          verificarCompletado();
        }
      });
    });
  }

  cargarDocentes() {
    this.docenteService.getDocentes().subscribe({
      next: (response: any) => {
        console.log('Respuesta del API:', response); // Para debug
        if (Array.isArray(response)) {
          this.docentes = response;
          this.filtrarDocentes();
        } else if (response && response.success && Array.isArray(response.docentes)) {
          this.docentes = response.docentes;
          this.filtrarDocentes();
        } else {
          console.error('Formato de respuesta inesperado:', response);
          this.docentes = [];
          this.filtrarDocentes();
        }
      },
      error: (error) => {
        console.error('Error cargando docentes:', error);
        this.docentes = [];
        this.filtrarDocentes();
      }
    });
  }

  cargarDocentesInactivos() {
    this.docenteService.getDocentesInactivos().subscribe({
      next: (response: any) => {
        console.log('Respuesta del API (inactivos):', response); // Para debug
        if (Array.isArray(response)) {
          this.docentesInactivos = response;
          this.filtrarDocentesInactivos();
        } else if (response && response.success && Array.isArray(response.docentes)) {
          this.docentesInactivos = response.docentes;
          this.filtrarDocentesInactivos();
        } else {
          console.error('Formato de respuesta inesperado (inactivos):', response);
          this.docentesInactivos = [];
          this.filtrarDocentesInactivos();
        }
      },
      error: (error) => {
        console.error('Error cargando docentes inactivos:', error);
        this.docentesInactivos = [];
        this.filtrarDocentesInactivos();
      }
    });
  }

  cambiarVista(mostrarInactivos: boolean) {
    this.mostrarInactivos = mostrarInactivos;
    this.paginaActual = 1;
    if (mostrarInactivos) {
      if (this.docentesInactivos.length === 0) {
        this.cargarDocentesInactivos();
      } else {
        this.filtrarDocentesInactivos();
      }
    } else {
      this.filtrarDocentes();
    }
  }

  filtrarSegunVista() {
    if (this.mostrarInactivos) {
      this.filtrarDocentesInactivos();
    } else {
      this.filtrarDocentes();
    }
  }

  filtrarDocentes() {
    this.docentesFiltrados = this.docentes.filter(docente => 
      this.filtrarPorContrato(docente) &&
      this.filtrarPorExperiencia(docente) &&
      this.filtrarPorNivel(docente) &&
      this.filtrarPorBusqueda(docente)
    );
    this.actualizarPaginacion();
  }

  filtrarDocentesInactivos() {
    this.docentesFiltrados = this.docentesInactivos.filter(docente => 
      this.filtrarPorContrato(docente) &&
      this.filtrarPorExperiencia(docente) &&
      this.filtrarPorNivel(docente) &&
      this.filtrarPorBusqueda(docente)
    );
    this.actualizarPaginacion();
  }

  filtrarPorContrato(docente: Docente): boolean {
    if (this.filtroContrato === 'Todos') return true;
    return docente.tipo_contrato?.nombre === this.filtroContrato;
  }

  filtrarPorExperiencia(docente: Docente): boolean {
    const experienciaMinima = Math.max(0, this.filtroExperiencia);
    return docente.experiencia_anios >= experienciaMinima;
  }

  filtrarPorNivel(docente: Docente): boolean {
    if (this.filtroNivelIngles === 'Todos') return true;
    return docente.nivel_ingles?.nombre === this.filtroNivelIngles;
  }

  filtrarPorBusqueda(docente: Docente): boolean {
    const texto = this.textoBusqueda.trim().toLowerCase();
    if (!texto) return true;
    
    const nombres = [
      docente.persona?.primer_nombre || '',
      docente.persona?.segundo_nombre || '',
      docente.persona?.primer_apellido || '',
      docente.persona?.segundo_apellido || ''
    ].join(' ').toLowerCase();
    
    return nombres.includes(texto);
  }

  actualizarPaginacion() {
    this.totalPaginas = Math.ceil(this.docentesFiltrados.length / this.docentesPorPagina);
    this.paginaActual = Math.min(this.paginaActual, this.totalPaginas);
    this.actualizarDocentesPaginados();
  }

  actualizarDocentesPaginados() {
    const inicio = (this.paginaActual - 1) * this.docentesPorPagina;
    const fin = inicio + this.docentesPorPagina;
    this.docentesPaginados = this.docentesFiltrados.slice(inicio, fin);
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
    this.actualizarDocentesPaginados();
  }

  resetearFiltros() {
    this.filtroContrato = 'Todos';
    this.filtroExperiencia = 0;
    this.filtroNivelIngles = 'Todos';
    this.textoBusqueda = '';
    this.paginaActual = 1;
    if (this.mostrarInactivos) {
      this.filtrarDocentesInactivos();
    } else {
      this.filtrarDocentes();
    }
  }

  verDocente(index: number) {
    this.docenteSeleccionado = this.docentesPaginados[index];
    this.mostrarModalVista = true;
  }

  cerrarModalVista() {
    this.mostrarModalVista = false;
    this.docenteSeleccionado = null;
  }

  formatTime(timeString: string | undefined | null): string {
    if (!timeString) return '';
    
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    
    return timeString;
  }

  obtenerRangoPagina(): { inicio: number, fin: number, total: number } {
    const inicio = (this.paginaActual - 1) * this.docentesPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.docentesPorPagina, this.docentesFiltrados.length);
    const total = this.docentesFiltrados.length;
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

  getEspecializaciones(): Array<{ especializacion?: { nombre?: string } }> {
    return this.docenteSeleccionado?.especializaciones || [];
  }

  getHorarios(): Array<{ dia: string; hora_inicio: string; hora_fin: string }> {
    return this.docenteSeleccionado?.horarios || [];
  }
}
