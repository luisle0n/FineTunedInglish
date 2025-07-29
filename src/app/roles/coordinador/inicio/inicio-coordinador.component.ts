import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { DocenteService, Docente } from '../../../services/docente.service';
import { DashboardService, DashboardStats } from '../../../services/dashboard.service';
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
  estadisticas: DashboardStats = {
    docentes: {
      docentes_activos: 0,
      docentes_inactivos: 0,
      total_docentes: 0,
      aulas_asignadas: 0,
      horas_programadas: 0,
      horas_disponibles: 0,
      distribucion_tipo_contrato: [],
      distribucion_nivel_ingles: []
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
  guardandoAula = false;

  // Datos para formularios
  nuevaAula: any = {
    numero: '',
    ubicacion: '',
    piso: '',
    tipo_aula: '',
    edad_minima: 0,
    edad_maxima: 0,
    capacidad: 0,
    observaciones: ''
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
    private docenteService: DocenteService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
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
    
    this.dashboardService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success && response.dashboard) {
          this.estadisticas = response.dashboard;
          this.procesarDatosParaGraficos();
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
    
    if (this.estadisticas.docentes?.distribucion_tipo_contrato) {
      this.distribucionContratos = {};
      this.estadisticas.docentes.distribucion_tipo_contrato.forEach((item: any) => {
        this.distribucionContratos[item.tipo_contrato] = item.total;
      });
    }
    
    if (this.estadisticas.docentes?.distribucion_nivel_ingles) {
      this.distribucionEdades = {};
      this.estadisticas.docentes.distribucion_nivel_ingles.forEach((item: any) => {
        this.distribucionEdades[item.nivel_ingles] = item.total;
      });
    }
    
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
    this.cdr.detectChanges();
  }

  cerrarModalAula(): void {
    this.mostrarModalAula = false;
    this.limpiarFormularioAula();
    this.cdr.detectChanges();
  }

  mostrarModalAgregarClase(): void {
    this.mostrarModalClase = true;
    this.cdr.detectChanges();
  }

  cerrarModalClase(): void {
    this.mostrarModalClase = false;
    this.limpiarFormularioClase();
    this.cdr.detectChanges();
  }

  mostrarModalAgregarUsuario(): void {
    this.mostrarModalUsuario = true;
    this.cdr.detectChanges();
  }

  cerrarModalUsuario(): void {
    this.mostrarModalUsuario = false;
    this.limpiarFormularioUsuario();
    this.cdr.detectChanges();
  }

  // === MÉTODOS DE FORMULARIOS ===
  agregarAula(): void {
    this.guardandoAula = true;
    
    const datosAula = {
      numero: Number(this.nuevaAula.numero),
      ubicacion: this.nuevaAula.ubicacion,
      piso: this.nuevaAula.piso,
      tipo_aula: this.nuevaAula.tipo_aula,
      edad_minima: Number(this.nuevaAula.edad_minima),
      edad_maxima: Number(this.nuevaAula.edad_maxima),
      capacidad: Number(this.nuevaAula.capacidad),
      observaciones: this.nuevaAula.observaciones
    };
    
    console.log('📤 JSON a enviar al crear aula:', JSON.stringify(datosAula, null, 2));
    console.log('📋 Objeto datosAula completo:', datosAula);
    
    this.http.post('http://localhost:3000/aulas', datosAula).subscribe({
      next: (response: any) => {
        this.showToastMessage('Aula creada exitosamente. Puedes ir a la vista de Aulas para verla.', 'success');
        this.cerrarModalAula();
        this.guardandoAula = false;
      },
      error: (error) => {
        console.error('Error al crear aula:', error);
        this.showToastMessage('Error al crear el aula. Verifica que todos los campos requeridos estén completos.', 'error');
        this.guardandoAula = false;
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
    this.nuevaAula = {
      numero: '',
      ubicacion: '',
      piso: '',
      tipo_aula: '',
      edad_minima: 0,
      edad_maxima: 0,
      capacidad: 0,
      observaciones: ''
    };
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

  private convertirABoolean(valor: any): boolean {
    if (typeof valor === 'boolean') {
      return valor;
    }
    if (typeof valor === 'string') {
      return valor.toLowerCase() === 'true';
    }
    if (typeof valor === 'number') {
      return valor !== 0;
    }
    return false;
  }
}
