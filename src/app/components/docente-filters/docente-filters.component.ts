import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-docente-filters',
  templateUrl: './docente-filters.component.html',
  styleUrls: ['./docente-filters.component.scss'],
  imports: [CommonModule, FormsModule]
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

  onFiltroContratoChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filtroContratoChange.emit(target?.value || '');
  }

  onFiltroNivelInglesChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filtroNivelInglesChange.emit(target?.value || '');
  }

  onFiltroExperienciaChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target?.value ? parseInt(target.value, 10) : 0;
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