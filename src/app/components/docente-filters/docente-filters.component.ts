import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-docente-filters',
  templateUrl: './docente-filters.component.html',
  styleUrls: ['./docente-filters.component.scss']
})
export class DocenteFiltersComponent {
  @Input() filtroContrato: string = 'Todos';
  @Input() filtroNivelIngles: string = 'Todos';
  @Input() filtroExperiencia: number = 0;
  @Input() textoBusqueda: string = '';
  @Input() contratos: any[] = [];
  @Input() nivelesIngles: any[] = [];

  @Output() filtroContratoChange = new EventEmitter<string>();
  @Output() filtroNivelInglesChange = new EventEmitter<string>();
  @Output() filtroExperienciaChange = new EventEmitter<number>();
  @Output() textoBusquedaChange = new EventEmitter<string>();
  @Output() resetearFiltros = new EventEmitter<void>();
  @Output() cargarExcel = new EventEmitter<Event>();

  onFiltroContratoChange(value: string): void {
    this.filtroContratoChange.emit(value);
  }

  onFiltroNivelInglesChange(value: string): void {
    this.filtroNivelInglesChange.emit(value);
  }

  onFiltroExperienciaChange(value: number): void {
    this.filtroExperienciaChange.emit(value);
  }

  onTextoBusquedaChange(value: string): void {
    this.textoBusquedaChange.emit(value);
  }

  onResetearFiltros(): void {
    this.resetearFiltros.emit();
  }

  onCargarExcel(event: Event): void {
    this.cargarExcel.emit(event);
  }
} 