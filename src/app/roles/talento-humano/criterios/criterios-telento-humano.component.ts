import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-criterios-talento-humano',
  standalone: true,
  templateUrl: './criterios-telento-humano.component.html',
  styleUrls: ['./criterios-telento-humano.component.scss'],
  imports: [HeaderComponent, CommonModule, FormsModule]
})
export class CriterioTalentoHumanoComponent {

  mostrarModal = false;

  // === CRITERIOS ===
  criteriosCarga = {
    tiempoCompleto: 40,
    medioTiempo: 20,
    ocasional: 10,
    clasesConsecutivas: 4,
  };

  criteriosPrioridad = {
    experiencia: 30,
    ingles: 30,
    especializacion: 40,
    minimaExperiencia: 2,
  };

  criteriosEdad = {
    ninos: { nivel: 'B2', anios: 1 },
    adolescentes: { nivel: 'B2', anios: 2 },
    adultos: { nivel: 'B2', anios: 3 },
  };

  // === PERSONALIZADOS ===
  criterios: {
    nombre: string;
    tipo: string;
    valor: number;
    unidad: string;
  }[] = [];

  nuevoCriterio = {
    nombre: '',
    tipo: '',
    valor: 0,
    unidad: '',
  };

  editIndex: number | null = null;

  constructor(private router: Router, private authService: AuthService) {}



  // === MODAL ===
  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.resetNuevoCriterio();
  }

  crearCriterio() {
    this.agregarCriterio();
  }

  agregarCriterio() {
    if (this.nuevoCriterio.nombre && this.nuevoCriterio.tipo) {
      this.criterios.push({ ...this.nuevoCriterio });
      this.cerrarModal();
    }
  }

  eliminarFila(index: number) {
    const confirmar = confirm('¿Estás seguro de eliminar este criterio?');
    if (confirmar) {
      this.criterios.splice(index, 1);
    }
  }

  editarFila(index: number) {
    this.editIndex = index;
  }

  guardarFila(index: number) {
    this.editIndex = null;
  }

  cancelarEdicion() {
    this.editIndex = null;
  }

  resetNuevoCriterio() {
    this.nuevoCriterio = {
      nombre: '',
      tipo: '',
      valor: 0,
      unidad: '',
    };
  }

  // === ACCIONES ===
  restaurarValores() {
    this.criteriosCarga = {
      tiempoCompleto: 40,
      medioTiempo: 20,
      ocasional: 10,
      clasesConsecutivas: 4,
    };

    this.criteriosPrioridad = {
      experiencia: 30,
      ingles: 30,
      especializacion: 40,
      minimaExperiencia: 2,
    };

    this.criteriosEdad = {
      ninos: { nivel: 'B2', anios: 1 },
      adolescentes: { nivel: 'B2', anios: 2 },
      adultos: { nivel: 'B2', anios: 3 },
    };

    this.criterios = [];
    this.resetNuevoCriterio();

    alert('Valores restaurados a los predeterminados.');
  }

  guardarCriterios() {
    console.log('Criterios de carga:', this.criteriosCarga);
    console.log('Criterios de prioridad:', this.criteriosPrioridad);
    console.log('Asignación por edad:', this.criteriosEdad);
    console.log('Criterios personalizados:', this.criterios);

    alert('Criterios guardados correctamente.');
  }
}
