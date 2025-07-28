import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { DocenteService, Docente } from '../../../services/docente.service';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { ToastNotificationComponent } from '../../../shared/components/toast-notification/toast-notification.component';

@Component({
  standalone: true,
  selector: 'app-inicio-coordinador',
  templateUrl: './inicio-coordinador.component.html',
  styleUrls: ['./inicio-coordinador.component.scss'],
  imports: [CommonModule, HeaderComponent, FormsModule, ToastNotificationComponent]
})

export class InicioCoordinadorComponent implements OnInit, AfterViewInit {
  // Variables para estadísticas del dashboard
  estadisticas: any = {
    docentes: {
      docentes_activos: 0,
      docentes_inactivos: 0,
      total_docentes: 0
    }
  };
  cargandoEstadisticas = true;

  // Datos para gráficos
  docentes: Docente[] = [];
  distribucionContratos: { [key: string]: number } = {};
  distribucionEdades: { [key: string]: number } = {};

  // Variables para modales
  mostrarModalAula = false;
  mostrarModalClase = false;
  mostrarModalUsuario = false;

  // Datos para formularios
  nuevaAula: any = {
    nombre: '',
    capacidad: 0,
    piso: ''
  };

  nuevaClase: any = {
    programa_id: '',
    cupos_proyectados: 10,
    paralelo: 'A',
    prioridad: 5,
    horario_solicitado: '',
    estado: 'pendiente',
    observaciones: ''
  };

  nuevoUsuario: any = {
    rolNombre: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    cedula: '',
    correo: '',
    telefono: '',
    password: ''
  };

  programas: any[] = [];

  // Toast notification properties
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'success';

  constructor(
    private router: Router, 
    private http: HttpClient, 
    private authService: AuthService,
    private docenteService: DocenteService
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarDocentesParaGraficos();
    this.cargarProgramas();
  }

  showToastMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.crearGraficos();
    }, 500);
  }

  // === CARGA DE ESTADÍSTICAS ===
  cargarEstadisticas(): void {
    this.cargandoEstadisticas = true;
    
    this.http.get<any>('http://localhost:3000/dashboard/estadisticas').subscribe({
      next: (response) => {
        if (response.success && response.dashboard) {
          this.estadisticas = response.dashboard;
        } else {
          console.error('❌ Respuesta inválida de la API');
        }
        this.cargandoEstadisticas = false;
      },
      error: (err) => {
        console.error('❌ Error cargando estadísticas:', err);
        this.cargandoEstadisticas = false;
      }
    });
  }

  // === CARGA DE DOCENTES PARA GRÁFICOS ===
  cargarDocentesParaGraficos(): void {
    this.docenteService.getDocentesActivos().subscribe({
      next: (docentes) => {
        this.docentes = docentes;
        this.procesarDatosParaGraficos();
      },
      error: (err) => {
        console.error('❌ Error cargando docentes:', err);
        this.usarDatosEjemplo();
      }
    });
  }

  // === PROCESAMIENTO DE DATOS PARA GRÁFICOS ===
  procesarDatosParaGraficos(): void {
    
    // Procesar distribución por tipo de contrato
    this.distribucionContratos = {};
    this.docentes.forEach(docente => {
      const tipoContrato = docente.tipo_contrato?.nombre || 'Sin Contrato';
      this.distribucionContratos[tipoContrato] = (this.distribucionContratos[tipoContrato] || 0) + 1;
    });
    
    // Procesar distribución por nivel de inglés
    this.distribucionEdades = {};
    this.docentes.forEach(docente => {
      const nivelIngles = docente.nivel_ingles?.nombre || 'Sin Nivel';
      this.distribucionEdades[nivelIngles] = (this.distribucionEdades[nivelIngles] || 0) + 1;
    });
    
  }

  // === DATOS DE EJEMPLO SI NO HAY DATOS REALES ===
  usarDatosEjemplo(): void {
    
    this.distribucionContratos = {
      'Tiempo Completo': 15,
      'Medio Tiempo': 12,
      'Por Horas': 8,
      'Contrato Fijo': 6,
      'Contrato Temporal': 4,
      'Consultor': 3
    };
    
    this.distribucionEdades = {
      'A1': 8,
      'A2': 12,
      'B1': 15,
      'B2': 10,
      'C1': 6,
      'C2': 3
    };
  }

  crearGraficos(): void {
    
    try {
      // Gráfico de dona para distribución por tipo de contrato
      const ctxDoughnut = document.getElementById('doughnutChart') as HTMLCanvasElement;
      if (ctxDoughnut) {
        
        const labels = Object.keys(this.distribucionContratos);
        const data = Object.values(this.distribucionContratos);
        
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB'];
        
        new Chart(ctxDoughnut, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors.slice(0, labels.length),
              borderColor: colors.slice(0, labels.length),
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#333' }
              }
            }
          }
        });
      } else {
        console.error('❌ No se encontró el canvas para el gráfico de dona');
      }

      // Gráfico de barras para distribución por nivel de inglés
      const ctxBar = document.getElementById('barChart') as HTMLCanvasElement;
      if (ctxBar) {
        
        const labels = Object.keys(this.distribucionEdades);
        const data = Object.values(this.distribucionEdades);
        
        const colors = ['#4BC0C0', '#FF9F40', '#9966FF', '#FF6384', '#36A2EB', '#FF6384'];
        
        new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Distribución por Nivel de Inglés',
              data: data,
              backgroundColor: colors.slice(0, labels.length),
              borderColor: colors.slice(0, labels.length),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: '#333' }
              },
              x: {
                ticks: { color: '#333' }
              }
            }
          }
        });
      } else {
        console.error('❌ No se encontró el canvas para el gráfico de barras');
      }
    } catch (error) {
      console.error('❌ Error creando gráficos:', error);
    }
  }

  // === ACCIONES RÁPIDAS ===
  mostrarModalAgregarAula(): void {
    this.mostrarModalAula = true;
  }

  cerrarModalAula(): void {
    this.mostrarModalAula = false;
    this.limpiarFormularioAula();
  }

  mostrarModalAgregarClase(): void {
    this.mostrarModalClase = true;
  }

  cerrarModalClase(): void {
    this.mostrarModalClase = false;
    this.limpiarFormularioClase();
  }

  mostrarModalAgregarUsuario(): void {
    this.mostrarModalUsuario = true;
  }

  cerrarModalUsuario(): void {
    this.mostrarModalUsuario = false;
    this.limpiarFormularioUsuario();
  }

  // === MÉTODOS DE FORMULARIOS ===
  agregarAula(): void {
    this.http.post('http://localhost:3000/aulas', this.nuevaAula).subscribe({
      next: (response) => {
        this.showToastMessage('Aula agregada exitosamente. Puedes ir a la vista de Aulas para verla.', 'success');
        this.cerrarModalAula();
      },
      error: (error) => {
        this.showToastMessage('Error al agregar el aula', 'error');
      }
    });
  }

  agregarClase(): void {
    this.http.post('http://localhost:3000/clases', this.nuevaClase).subscribe({
      next: (response) => {
        this.showToastMessage('Clase agregada exitosamente. Puedes ir a la vista de Clases para verla.', 'success');
        this.cerrarModalClase();
      },
      error: (error) => {
        this.showToastMessage('Error al agregar la clase', 'error');
      }
    });
  }

  crearUsuario(): void {
    this.http.post('http://localhost:3000/usuarios', this.nuevoUsuario).subscribe({
      next: (response) => {
        this.showToastMessage('Usuario creado exitosamente. Puedes ir a la vista de Usuarios para verlo.', 'success');
        this.cerrarModalUsuario();
      },
      error: (error) => {
        this.showToastMessage('Error al crear el usuario', 'error');
      }
    });
  }

  // === MÉTODOS AUXILIARES ===
  cargarProgramas(): void {
    // Usar programas de ejemplo ya que el endpoint /programas no existe en el backend
    this.programas = [
      { id: 1, nombre: 'Inglés Básico', nivel: 'A1' },
      { id: 2, nombre: 'Inglés Intermedio', nivel: 'B1' },
      { id: 3, nombre: 'Inglés Avanzado', nivel: 'C1' }
    ];
  }

  limpiarFormularioAula(): void {
    this.nuevaAula = { nombre: '', capacidad: 0, piso: '' };
  }

  limpiarFormularioClase(): void {
    this.nuevaClase = {
      programa_id: '',
      cupos_proyectados: 10,
      paralelo: 'A',
      prioridad: 5,
      horario_solicitado: '',
      estado: 'pendiente',
      observaciones: ''
    };
  }

  limpiarFormularioUsuario(): void {
    this.nuevoUsuario = {
      rolNombre: '',
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      cedula: '',
      correo: '',
      telefono: '',
      password: ''
    };
  }
}
