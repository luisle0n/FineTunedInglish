import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Pipe({name: 'noSpaces'})
export class NoSpacesPipe implements PipeTransform {
  transform(value: string): string {
    return value ? value.replace(/\s+/g, '') : '';
  }
}

@Component({
  selector: 'app-horarios-gerente',
  standalone: true,
  templateUrl: './horarios-gerente.component.html',
  styleUrls: ['./horarios-gerente.component.scss'],
  imports: [CommonModule, FormsModule, NoSpacesPipe, HeaderComponent]
})
export class HorariosGerenteComponent implements OnInit {
  vistaSeleccionada: string = 'carga-docentes';
  dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  pageSize = 10;
  paginaDocentes = 1;
  paginaAulas = 1;
  paginaResumen = 1;
  paginaHorario = 1;
  cargaDocentes: any[] = [];
  ocupacionAulas: any[] = [];
  resumenProgramas: any[] = [];
  horarioCompleto: any[] = [];
  horarioPorPiso: any[] = [];
  docenteSeleccionado: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarCargaDocentes();
    this.cargarOcupacionAulas();
    this.cargarResumenProgramas();
    this.cargarHorarioCompleto();
    this.cargarHorarioPorPiso();
  }

  cargarCargaDocentes() {
    this.http.get<any>('http://localhost:3000/vistas/carga-docentes').subscribe(response => {
      this.cargaDocentes = response.data || response;
    });
  }
  cargarOcupacionAulas() {
    this.http.get<any>('http://localhost:3000/vistas/ocupacion-aulas').subscribe(response => {
      this.ocupacionAulas = response.data || response;
    });
  }
  cargarResumenProgramas() {
    this.http.get<any>('http://localhost:3000/vistas/resumen-programas').subscribe(response => {
      this.resumenProgramas = response.data || response;
    });
  }
  cargarHorarioCompleto() {
    this.http.get<any>('http://localhost:3000/vistas/horario-completo').subscribe(response => {
      this.horarioCompleto = response.data || response;
    });
  }
  cargarHorarioPorPiso() {
    this.http.get<any>('http://localhost:3000/vistas/horario-por-piso').subscribe(response => {
      this.horarioPorPiso = response.data || response;
    });
  }

  get cargaDocentesPaginados() {
    const start = (this.paginaDocentes - 1) * this.pageSize;
    return this.cargaDocentes.slice(start, start + this.pageSize);
  }
  get ocupacionAulasPaginadas() {
    const start = (this.paginaAulas - 1) * this.pageSize;
    return this.ocupacionAulas.slice(start, start + this.pageSize);
  }
  get resumenProgramasPaginados() {
    const start = (this.paginaResumen - 1) * this.pageSize;
    return this.resumenProgramas.slice(start, start + this.pageSize);
  }
  get horarioCompletoPaginado() {
    const start = (this.paginaHorario - 1) * this.pageSize;
    return this.horarioCompleto.slice(start, start + this.pageSize);
  }
  get horarioPorPisoPaginado() {
    const start = (this.paginaHorario - 1) * this.pageSize;
    return this.horarioPorPiso.slice(start, start + this.pageSize);
  }

  getPages(tipo: string): number[] {
    let total = 0;
    if (tipo === 'docentes') total = this.cargaDocentes.length;
    if (tipo === 'aulas') total = this.ocupacionAulas.length;
    if (tipo === 'resumen') total = this.resumenProgramas.length;
    if (tipo === 'horario') total = this.horarioCompleto.length;
    if (tipo === 'piso') total = this.horarioPorPiso.length;
    const pages = Math.ceil(total / this.pageSize);
    return Array.from({ length: pages }, (_, i) => i + 1);
  }

  cambiarPaginaDocentes(p: number) { this.paginaDocentes = p; }
  cambiarPaginaAulas(p: number) { this.paginaAulas = p; }
  cambiarPaginaResumen(p: number) { this.paginaResumen = p; }
  cambiarPaginaHorario(p: number) { this.paginaHorario = p; }
  min(a: number, b: number) { return Math.min(a, b); }

  verDocente(doc: any) {
    this.docenteSeleccionado = doc;
  }
} 