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

@Component({
  standalone: true,
  selector: 'app-inicio-gerente',
  templateUrl: './inicio-gerente.component.html',
  styleUrls: ['./inicio-gerente.component.scss'],
  imports: [CommonModule, FormsModule, HeaderComponent]
})
export class InicioGerenteComponent implements OnInit, AfterViewInit {
  // Variables para gráficas
  docentes: Docente[] = [];
  distribucionContratos: { [key: string]: number } = {};
  distribucionEdades: { [key: string]: number } = {};

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
  cargando = true;
  cargandoEstadisticas = true;

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

  constructor(
    private router: Router, 
    private authService: AuthService, 
    private http: HttpClient,
    private docenteService: DocenteService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
    this.cargarDocentesParaGraficos();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      console.log('⏰ ngAfterViewInit ejecutado, creando gráficos...');
      this.crearGraficos();
    }, 500);
  }

  // === CARGA DE ESTADÍSTICAS ===
  cargarEstadisticas(): void {
    this.cargandoEstadisticas = true;
    console.log('📊 Cargando estadísticas del dashboard...');
    
    this.dashboardService.getDashboardStats().subscribe({
      next: (response) => {
        console.log('📊 Respuesta completa de la API:', response);
        if (response.success && response.dashboard) {
          this.estadisticas = response.dashboard;
          console.log('✅ Estadísticas cargadas:', this.estadisticas);
          console.log('📈 Total docentes:', this.estadisticas.docentes.total_docentes);
          this.procesarDatosParaGraficos();
        } else {
          console.error('❌ Respuesta inválida de la API');
        }
        this.cargando = false;
        this.cargandoEstadisticas = false;
      },
      error: (err) => {
        console.error('❌ Error cargando estadísticas:', err);
        this.cargando = false;
        this.cargandoEstadisticas = false;
      }
    });
  }

  // === CARGA DE DOCENTES PARA GRÁFICOS ===
  cargarDocentesParaGraficos(): void {
    console.log('📊 Cargando docentes para gráficos...');
    this.docenteService.getDocentesActivos().subscribe({
      next: (docentes) => {
        console.log('✅ Docentes recibidos del servicio:', docentes);
        this.docentes = docentes;
        console.log('✅ Docentes cargados:', docentes.length);
        this.procesarDatosParaGraficos();
      },
      error: (err) => {
        console.error('❌ Error cargando docentes:', err);
        console.log('⚠️ Usando datos de ejemplo debido al error...');
        this.usarDatosEjemplo();
      }
    });
  }

  // === PROCESAMIENTO DE DATOS PARA GRÁFICOS ===
  procesarDatosParaGraficos(): void {
    console.log('🔄 Procesando datos para gráficos...');
    
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
    
    console.log('📊 Distribución por contratos:', this.distribucionContratos);
    console.log('📊 Distribución por niveles de inglés:', this.distribucionEdades);
  }

  // === DATOS DE EJEMPLO PARA GRÁFICOS ===
  usarDatosEjemplo(): void {
    console.log('📊 Usando datos de ejemplo para gráficos...');
    
    this.distribucionContratos = {
      'Dependencia': 15,
      'Por Horas': 5
    };
    
    this.distribucionEdades = {
      'B2': 7,
      'C2': 6,
      'C1': 5,
      'A2': 1,
      'A1': 1
    };
    
    console.log('📊 Datos de ejemplo cargados');
  }

  // === CREACIÓN DE GRÁFICOS ===
  crearGraficos(): void {
    console.log('🎨 Creando gráficos...');
    
    try {
      // Gráfico de dona - Distribución por tipo de contrato
      const ctxDoughnut = document.getElementById('doughnutChart') as HTMLCanvasElement;
      if (ctxDoughnut) {
        const labels = Object.keys(this.distribucionContratos);
        const data = Object.values(this.distribucionContratos);
        
        new Chart(ctxDoughnut, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF'
              ],
              borderWidth: 2,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true
                }
              }
            }
          }
        });
        console.log('✅ Gráfico de dona creado');
      }

      // Gráfico de barras - Distribución por nivel de inglés
      const ctxBar = document.getElementById('barChart') as HTMLCanvasElement;
      if (ctxBar) {
        const labels = Object.keys(this.distribucionEdades);
        const data = Object.values(this.distribucionEdades);
        
        new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Docentes',
              data: data,
              backgroundColor: [
                '#20B2AA',
                '#FF8C00',
                '#9370DB',
                '#FF69B4',
                '#4169E1'
              ],
              borderColor: [
                '#20B2AA',
                '#FF8C00',
                '#9370DB',
                '#FF69B4',
                '#4169E1'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
        console.log('✅ Gráfico de barras creado');
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
  }

  mostrarModalAgregarUsuario(): void {
    this.mostrarModalUsuario = true;
  }

  cerrarModalUsuario(): void {
    this.mostrarModalUsuario = false;
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
        console.log('✅ Aula creada exitosamente:', response);
        this.cerrarModalAula();
        this.guardandoAula = false;
      },
      error: (error) => {
        console.error('❌ Error al crear aula:', error);
        this.guardandoAula = false;
      }
    });
  }

  // === MÉTODOS AUXILIARES ===
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
