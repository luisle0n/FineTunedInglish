import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { DocenteService, Docente } from '../../../services/docente.service';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';

@Component({
  standalone: true,
  selector: 'app-inicio-coordinador',
  templateUrl: './inicio-coordinador.component.html',
  styleUrls: ['./inicio-coordinador.component.scss'],
  imports: [CommonModule, HeaderComponent, FormsModule]
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
    
    this.http.get<any>('http://localhost:3000/dashboard/estadisticas').subscribe({
      next: (response) => {
        console.log('📊 Respuesta completa de la API:', response);
        if (response.success && response.dashboard) {
          this.estadisticas = response.dashboard;
          console.log('✅ Estadísticas cargadas:', this.estadisticas);
          console.log('📈 Total docentes:', this.estadisticas.docentes.total_docentes);
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
    
    console.log('📊 Distribución por contratos:', this.distribucionContratos);
    console.log('📊 Distribución por nivel de inglés:', this.distribucionEdades);
  }

  // === DATOS DE EJEMPLO SI NO HAY DATOS REALES ===
  usarDatosEjemplo(): void {
    console.log('⚠️ Usando datos de ejemplo...');
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
    console.log('🎨 Creando gráficos...');
    console.log('📊 Datos de contratos disponibles:', this.distribucionContratos);
    console.log('📊 Datos de niveles de inglés disponibles:', this.distribucionEdades);
    
    try {
      // Gráfico de dona para distribución por tipo de contrato
      const ctxDoughnut = document.getElementById('doughnutChart') as HTMLCanvasElement;
      if (ctxDoughnut) {
        console.log('📊 Creando gráfico de dona...');
        const labels = Object.keys(this.distribucionContratos);
        const data = Object.values(this.distribucionContratos);
        console.log('📊 Labels del gráfico de dona:', labels);
        console.log('📊 Data del gráfico de dona:', data);
        
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
        console.log('✅ Gráfico de dona creado exitosamente con datos reales');
      } else {
        console.error('❌ No se encontró el canvas para el gráfico de dona');
      }

      // Gráfico de barras para distribución por nivel de inglés
      const ctxBar = document.getElementById('barChart') as HTMLCanvasElement;
      if (ctxBar) {
        console.log('📊 Creando gráfico de barras...');
        const labels = Object.keys(this.distribucionEdades);
        const data = Object.values(this.distribucionEdades);
        console.log('📊 Labels del gráfico de barras:', labels);
        console.log('📊 Data del gráfico de barras:', data);
        
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
        console.log('✅ Gráfico de barras creado exitosamente con datos reales');
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
    console.log('🏫 Agregando aula:', this.nuevaAula);
    this.http.post('http://localhost:3000/aulas', this.nuevaAula).subscribe({
      next: (response) => {
        console.log('✅ Aula agregada exitosamente:', response);
        alert('Aula agregada exitosamente. Puedes ir a la vista de Aulas para verla.');
        this.cerrarModalAula();
      },
      error: (error) => {
        console.error('❌ Error agregando aula:', error);
        alert('Error al agregar el aula');
      }
    });
  }

  agregarClase(): void {
    console.log('📚 Agregando clase:', this.nuevaClase);
    this.http.post('http://localhost:3000/clases', this.nuevaClase).subscribe({
      next: (response) => {
        console.log('✅ Clase agregada exitosamente:', response);
        alert('Clase agregada exitosamente. Puedes ir a la vista de Clases para verla.');
        this.cerrarModalClase();
      },
      error: (error) => {
        console.error('❌ Error agregando clase:', error);
        alert('Error al agregar la clase');
      }
    });
  }

  crearUsuario(): void {
    console.log('👤 Creando usuario:', this.nuevoUsuario);
    this.http.post('http://localhost:3000/usuarios', this.nuevoUsuario).subscribe({
      next: (response) => {
        console.log('✅ Usuario creado exitosamente:', response);
        alert('Usuario creado exitosamente. Puedes ir a la vista de Usuarios para verlo.');
        this.cerrarModalUsuario();
      },
      error: (error) => {
        console.error('❌ Error creando usuario:', error);
        alert('Error al crear el usuario');
      }
    });
  }

  // === MÉTODOS AUXILIARES ===
  cargarProgramas(): void {
    this.http.get<any[]>('http://localhost:3000/programas').subscribe({
      next: (response) => {
        this.programas = response;
        console.log('✅ Programas cargados:', this.programas);
      },
      error: (error) => {
        console.error('❌ Error cargando programas:', error);
        // Si falla, usar programas de ejemplo
        this.programas = [
          { id: 1, nombre: 'Inglés Básico', nivel: 'A1' },
          { id: 2, nombre: 'Inglés Intermedio', nivel: 'B1' },
          { id: 3, nombre: 'Inglés Avanzado', nivel: 'C1' }
        ];
      }
    });
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
