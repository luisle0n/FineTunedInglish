import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Docente } from '../../services/docente.service';

@Component({
  selector: 'app-docente-table',
  templateUrl: './docente-table.component.html',
  styleUrls: ['./docente-table.component.scss']
})
export class DocenteTableComponent {
  @Input() docentes: Docente[] = [];
  @Input() mostrarInactivos: boolean = false;
  @Input() editIndex: number | null = null;
  @Input() contratos: any[] = [];
  @Input() nivelesIngles: any[] = [];
  @Input() especializaciones: any[] = [];

  @Output() editar = new EventEmitter<number>();
  @Output() eliminar = new EventEmitter<number>();
  @Output() reactivar = new EventEmitter<number>();
  @Output() ver = new EventEmitter<number>();
  @Output() guardar = new EventEmitter<number>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() validarExperiencia = new EventEmitter<Event>();
  @Output() validarHoras = new EventEmitter<Event>();
  @Output() toggleEspecializacion = new EventEmitter<{docente: any, id: string, event: Event}>();

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

  onEditar(index: number): void {
    this.editar.emit(index);
  }

  onEliminar(index: number): void {
    this.eliminar.emit(index);
  }

  onReactivar(index: number): void {
    this.reactivar.emit(index);
  }

  onVer(index: number): void {
    this.ver.emit(index);
  }

  onGuardar(index: number): void {
    this.guardar.emit(index);
  }

  onCancelar(): void {
    this.cancelar.emit();
  }

  onValidarExperiencia(event: Event): void {
    this.validarExperiencia.emit(event);
  }

  onValidarHoras(event: Event): void {
    this.validarHoras.emit(event);
  }

  onToggleEspecializacion(docente: any, id: string, event: Event): void {
    this.toggleEspecializacion.emit({ docente, id, event });
  }
} 