import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Pipe({name: 'noSpaces'})
export class NoSpacesPipe implements PipeTransform {
  transform(value: string): string {
    return value ? value.replace(/\s+/g, '') : '';
  }
}

interface HorarioDocente {
  nombre: string;
  contrato: string;
  horario: {
    [dia: string]: string[];
  };
  totalHoras: number;
}

@Component({
  selector: 'app-horario-talento-humano',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule],
  templateUrl: './horario-talento-humano.component.html',
  styleUrls: ['./horario-talento-humano.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class HorarioTalentoHumanoComponent implements OnInit {
  archivoHorario: File | null = null;
  archivoEmpresarial: File | null = null;
  archivoAulas: File | null = null;

  configuracion = {
    priorizar: 'balanceado',
    distribuir: 'preferencias',
    fecha: '',
    periodo: '2024-1',
    respetarPeriodo: false,
    balancearTipoContrato: true
  };

  dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  horarioGenerado: any[] = [];
  vistaSeleccionada: string = 'carga-docentes';
  resultadoVista: any = null;

  cargaDocentes: any[] = [];
  ocupacionAulas: any[] = [];
  resumenProgramas: any[] = [];
  docenteSeleccionado: any | null = null;
  aulasResumen: any[] = [];

  // Paginación para cada vista
  paginaDocentes = 1;
  paginaHorario = 1;
  paginaAulas = 1;
  paginaResumen = 1;
  pageSize = 10;

  cargandoHorario: boolean = false;
  resultadoAsignacion: any[] = [];
  horarioCompleto: any[] = [];
  horarioPorPiso: any[] = [];

  get cargaDocentesPaginados() {
    const start = (this.paginaDocentes - 1) * this.pageSize;
    return this.cargaDocentes.slice(start, start + this.pageSize);
  }
  get horarioGeneradoPaginado() {
    const start = (this.paginaHorario - 1) * this.pageSize;
    return this.horarioGenerado.slice(start, start + this.pageSize);
  }
  get ocupacionAulasPaginadas() {
    const start = (this.paginaAulas - 1) * this.pageSize;
    return this.ocupacionAulas.slice(start, start + this.pageSize);
  }
  get resumenProgramasPaginados() {
    const start = (this.paginaResumen - 1) * this.pageSize;
    return this.resumenProgramas.slice(start, start + this.pageSize);
  }

  getPages(tipo: string): number[] {
    let total = 0;
    if (tipo === 'docentes') total = this.cargaDocentes.length;
    if (tipo === 'horario') total = this.horarioGenerado.length;
    if (tipo === 'aulas') total = this.ocupacionAulas.length;
    if (tipo === 'resumen') total = this.resumenProgramas.length;
    const pages = Math.ceil(total / this.pageSize);
    return Array.from({ length: pages }, (_, i) => i + 1);
  }

  cambiarPaginaDocentes(p: number) { this.paginaDocentes = p; }
  cambiarPaginaHorario(p: number) { this.paginaHorario = p; }
  cambiarPaginaAulas(p: number) { this.paginaAulas = p; }
  cambiarPaginaResumen(p: number) { this.paginaResumen = p; }

  min(a: number, b: number) { return Math.min(a, b); }

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.generarHorario();
    this.cargarCargaDocentes();
    this.cargarOcupacionAulas();
    this.cargarResumenProgramas();
  }

  generarHorario(): void {
    this.cargandoHorario = true;
    this.resultadoAsignacion = [];
    this.http.post<any>('http://localhost:3000/asignacion/generar', {}).subscribe({
      next: (response) => {
        this.resultadoAsignacion = response.resultado;
        this.cargandoHorario = false;
        this.cargarHorarioCompleto();
        this.cargarHorarioPorPiso();
      },
      error: (err) => {
        this.resultadoAsignacion = [];
        this.cargandoHorario = false;
      }
    });
  }

  cargarHorarioCompleto() {
    this.http.get<any>('http://localhost:3000/vistas/horario-completo').subscribe({
      next: (response) => {
        this.horarioCompleto = response.data || response;
        this.generarResumenAulas();
      },
      error: () => this.horarioCompleto = []
    });
  }

  cargarHorarioPorPiso() {
    this.http.get<any>('http://localhost:3000/vistas/horario-por-piso').subscribe({
      next: (response) => this.horarioPorPiso = response.data || response,
      error: () => this.horarioPorPiso = []
    });
  }

  cargarCargaDocentes() {
    this.http.get<any>('http://localhost:3000/vistas/carga-docentes').subscribe({
      next: (response) => this.cargaDocentes = response.data,
      error: () => this.cargaDocentes = []
    });
  }

  cargarOcupacionAulas() {
    this.http.get<any>('http://localhost:3000/vistas/ocupacion-aulas').subscribe({
      next: (response) => this.ocupacionAulas = response.data,
      error: () => this.ocupacionAulas = []
    });
  }

  cargarResumenProgramas() {
    this.http.get<any>('http://localhost:3000/vistas/resumen-programas').subscribe({
      next: (response) => this.resumenProgramas = response.data,
      error: () => this.resumenProgramas = []
    });
  }

  verDocente(doc: any) {
    this.docenteSeleccionado = doc;
  }

  /**
   * Devuelve una clase CSS según el total de horas:
   * - >= 24: rojo
   * - 16 a <24: amarillo
   * - < 16: verde
   */
  getColorPorCarga(horas: number): string {
    if (horas >= 24) return 'bg-red';
    if (horas >= 16) return 'bg-orange';
    return 'bg-blue';
  }

  subirArchivo(tipo: 'horario' | 'empresarial' | 'aulas', evento: Event): void {
    const input = evento.target as HTMLInputElement;
    if (input?.files?.length) {
      const archivo = input.files[0];
      if (tipo === 'horario') this.archivoHorario = archivo;
      if (tipo === 'empresarial') this.archivoEmpresarial = archivo;
      if (tipo === 'aulas') this.archivoAulas = archivo;
    }
  }

  cargarVistaSeleccionada() {
    this.resultadoVista = null;
    if (!this.vistaSeleccionada) return;

    let url = '';
    switch (this.vistaSeleccionada) {
      case 'resumen-programas':
        url = '/vistas/resumen-programas';
        break;
      case 'carga-docentes':
        url = '/vistas/carga-docentes';
        break;
      case 'horario-por-piso':
        url = '/vistas/horario-por-piso';
        break;
      case 'ocupacion-aulas':
        url = '/vistas/ocupacion-aulas';
        break;
    }

    this.http.get(url).subscribe({
      next: (data) => this.resultadoVista = data,
      error: (err) => this.resultadoVista = { error: 'Error al cargar la vista', detalle: err }
    });
  }

  resetearHorario(): void {
    const confirmado = confirm('¿Estás seguro de que deseas resetear el horario? Se eliminará la información de Horario Completo y Horario de Todos los Pisos.');
    if (!confirmado) return;
    this.http.post<any>('http://localhost:3000/asignacion/resetear', {}).subscribe({
      next: (response) => {
        alert(response.message || 'Ambiente reseteado correctamente');
        // Limpiar solo los datos de horario y resultado
        this.resultadoAsignacion = [];
        this.horarioCompleto = [];
        this.horarioPorPiso = [];
        // Recargar las vistas de docentes, aulas y programas
        this.cargarCargaDocentes();
        this.cargarOcupacionAulas();
        this.cargarResumenProgramas();
      },
      error: (err) => {
        alert('Error al resetear el ambiente');
      }
    });
  }

  private generarResumenAulas() {
    const resumenAulas: any = {};
    (this.horarioCompleto || []).forEach(clase => {
      if (!resumenAulas[clase.aula]) {
        resumenAulas[clase.aula] = {
          aula: clase.aula,
          categoria: clase.categoria || clase.programa,
          grupo: clase.nivel,
          docente: clase.docente,
          horas: 0,
          dias: new Set<string>(),
          horarios: []
        };
      }
      resumenAulas[clase.aula].horas += 1;
      resumenAulas[clase.aula].dias.add(clase.dia);
      resumenAulas[clase.aula].horarios.push(`${clase.dia} ${clase.hora_inicio.slice(0,5)}-${clase.hora_fin.slice(0,5)}`);
    });
    this.aulasResumen = Object.values(resumenAulas).map(aula => ({
      ...(aula as any),
      dias: Array.from((aula as any).dias).join(', '),
      horarios: Array.from(new Set((aula as any).horarios))
    }));
  }
}
