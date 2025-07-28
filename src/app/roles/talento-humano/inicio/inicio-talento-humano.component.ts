import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { DocenteService, Docente } from '../../../services/docente.service';
import { limpiarLineasCSV, extraerEncabezados, procesarFilas, transformarAFilaDocente } from '../../../../utils/excel-utils';
import { ToastNotificationComponent } from '../../../shared/components/toast-notification/toast-notification.component';

@Component({
  standalone: true,
  selector: 'app-inicio-coordinador',
  templateUrl: './inicio-talento-humano.component.html',
  styleUrls: ['./inicio-talento-humano.component.scss'],
  imports: [CommonModule, FormsModule, HeaderComponent, ToastNotificationComponent]
})

export class InicioTalentoHuemanoComponent implements OnInit, AfterViewInit {
  // Variables para modales
  mostrarModalNuevoDocente = false;
  mostrarModalCargarDatos = false;
  mostrarModalGenerarHorario = false;
  mostrarModalConfirmacion = false;

  // Variables para gráficas
  docentes: Docente[] = [];
  distribucionContratos: { [key: string]: number } = {};
  distribucionEdades: { [key: string]: number } = {};

  // Catálogos
  contratos: any[] = [];
  nivelesIngles: any[] = [];
  especializaciones: any[] = [];
  horariosDisponibles: any[] = [];

  // Nuevo docente
  nuevoDocente: any = {
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    cedula: '',
    correo: '',
    telefono: '',
    tipo_contrato_id: '',
    experiencia_anios: 0,
    nivel_ingles_id: '',
    horas_disponibles: 0,
    max_horas_semanales: 30,
    puede_dar_sabados: true,
    especializaciones: [],
    horarios: []
  };

  // Variables para carga de datos
  docentesPendientes: any[] = [];
  archivoSeleccionado: File | null = null;

  // Variables para estadísticas del dashboard
  estadisticas: any = {
    docentes: {
      docentes_activos: 0,
      docentes_inactivos: 0,
      total_docentes: 0
    }
  };
  cargandoEstadisticas = true;

  // Toast notification properties
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'success';

  constructor(
    private router: Router, 
    private authService: AuthService, 
    private http: HttpClient,
    private docenteService: DocenteService
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarEstadisticas();
    this.cargarDocentesParaGraficos();
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

  // === CARGA DE CATÁLOGOS ===
  cargarCatalogos(): Promise<void> {
    return new Promise((resolve) => {
      let catalogosCargados = 0;
      const totalCatalogos = 4;

      const verificarCompletado = () => {
        catalogosCargados++;
        if (catalogosCargados === totalCatalogos) {
          console.log('✅ Todos los catálogos cargados');
          resolve();
        }
      };

      this.http.get<any[]>('http://localhost:3000/catalogos/tipos-contrato').subscribe({
        next: (data) => {
          this.contratos = data;
          console.log('📋 Contratos cargados:', data.length);
          verificarCompletado();
        },
        error: (err) => {
          console.error('❌ Error cargando contratos:', err);
          verificarCompletado();
        }
      });

      this.http.get<any[]>('http://localhost:3000/catalogos/niveles-ingles').subscribe({
        next: (data) => {
          this.nivelesIngles = data;
          console.log('📋 Niveles de inglés cargados:', data.length);
          verificarCompletado();
        },
        error: (err) => {
          console.error('❌ Error cargando niveles de inglés:', err);
          verificarCompletado();
        }
      });

      this.http.get<any[]>('http://localhost:3000/catalogos/especializaciones').subscribe({
        next: (data) => {
          this.especializaciones = data;
          console.log('📋 Especializaciones cargadas:', data.length);
          verificarCompletado();
        },
        error: (err) => {
          console.error('❌ Error cargando especializaciones:', err);
          verificarCompletado();
        }
      });

      this.http.get<any[]>('http://localhost:3000/catalogos/horarios').subscribe({
        next: (data) => {
          this.horariosDisponibles = data;
          console.log('📋 Horarios cargados:', data.length);
          verificarCompletado();
        },
        error: (err) => {
          console.error('❌ Error cargando horarios:', err);
          verificarCompletado();
        }
      });
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
        
        new (window as any).Chart(ctxDoughnut, {
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
        
        new (window as any).Chart(ctxBar, {
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
  abrirModalNuevoDocente() {
    this.mostrarModalNuevoDocente = true;
  }

  cerrarModalNuevoDocente() {
    this.mostrarModalNuevoDocente = false;
    this.resetearFormulario();
  }

  abrirModalCargarDatos() {
    this.mostrarModalCargarDatos = true;
  }

  cerrarModalCargarDatos() {
    this.mostrarModalCargarDatos = false;
  }

  abrirModalGenerarHorario() {
    this.mostrarModalGenerarHorario = true;
  }

  cerrarModalGenerarHorario() {
    this.mostrarModalGenerarHorario = false;
  }

  // === FORMULARIO NUEVO DOCENTE ===
  resetearFormulario() {
    this.nuevoDocente = {
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      cedula: '',
      correo: '',
      telefono: '',
      tipo_contrato_id: '',
      experiencia_anios: 0,
      nivel_ingles_id: '',
      horas_disponibles: 0,
      max_horas_semanales: 30,
      puede_dar_sabados: true,
      especializaciones: [],
      horarios: []
    };
  }

  toggleEspecializacion(id: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.nuevoDocente.especializaciones.includes(id)) {
        this.nuevoDocente.especializaciones.push(id);
      }
    } else {
      this.nuevoDocente.especializaciones = this.nuevoDocente.especializaciones.filter((espId: string) => espId !== id);
    }
  }

  toggleHorario(id: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.nuevoDocente.horarios.includes(id)) {
        this.nuevoDocente.horarios.push(id);
      }
    } else {
      this.nuevoDocente.horarios = this.nuevoDocente.horarios.filter((horarioId: string) => horarioId !== id);
    }
  }

  toggleAllHorarios(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.nuevoDocente.horarios = this.horariosDisponibles.map(horario => horario.id);
    } else {
      this.nuevoDocente.horarios = [];
    }
  }

  areAllHorariosSelected(): boolean {
    return this.horariosDisponibles.length > 0 && this.nuevoDocente.horarios.length === this.horariosDisponibles.length;
  }

  areSomeHorariosSelected(): boolean {
    return this.nuevoDocente.horarios.length > 0 && this.nuevoDocente.horarios.length < this.horariosDisponibles.length;
  }

  isHorarioSelected(horarioId: string): boolean {
    return this.nuevoDocente.horarios.includes(horarioId);
  }

  getSelectedHorariosCount(): number {
    return this.nuevoDocente.horarios.length;
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    
    return timeString;
  }

  validarExperienciaModal(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = parseInt(input.value);
    
    if (valor < 0) {
      input.value = '0';
      this.nuevoDocente.experiencia_anios = 0;
    } else if (valor > 50) {
      input.value = '50';
      this.nuevoDocente.experiencia_anios = 50;
    }
  }

  validarHorasModal(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = parseInt(input.value);
    
    if (valor < 0) {
      input.value = '0';
      this.nuevoDocente.horas_disponibles = 0;
    } else if (valor > 40) {
      input.value = '40';
      this.nuevoDocente.horas_disponibles = 40;
    }
  }

  validarMaxHorasModal(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = parseInt(input.value);
    
    if (valor < 1) {
      input.value = '1';
      this.nuevoDocente.max_horas_semanales = 1;
    } else if (valor > 40) {
      input.value = '40';
      this.nuevoDocente.max_horas_semanales = 40;
    }
  }

  guardarDocente() {
    console.log('💾 Guardando docente:', this.nuevoDocente);
    
    const payload = {
      primer_nombre: this.nuevoDocente.primer_nombre,
      segundo_nombre: this.nuevoDocente.segundo_nombre,
      primer_apellido: this.nuevoDocente.primer_apellido,
      segundo_apellido: this.nuevoDocente.segundo_apellido,
      cedula: this.nuevoDocente.cedula,
      correo: this.nuevoDocente.correo,
      telefono: this.nuevoDocente.telefono,
      tipo_contrato_id: this.nuevoDocente.tipo_contrato_id,
      experiencia_anios: this.nuevoDocente.experiencia_anios,
      nivel_ingles_id: this.nuevoDocente.nivel_ingles_id,
      horas_disponibles: this.nuevoDocente.horas_disponibles,
      max_horas_semanales: this.nuevoDocente.max_horas_semanales,
      puede_dar_sabados: this.nuevoDocente.puede_dar_sabados,
      especializaciones: this.nuevoDocente.especializaciones,
      horarios: this.nuevoDocente.horarios
    };

    this.http.post('http://localhost:3000/docentes', payload).subscribe({
      next: () => {
        console.log('✅ Docente guardado exitosamente');
        this.cerrarModalNuevoDocente();
        this.cargarEstadisticas(); // Recargar estadísticas
        this.showToastMessage('Docente guardado exitosamente', 'success');
      },
      error: (err) => {
        console.error('❌ Error al guardar docente:', err);
        this.showToastMessage('Error al guardar el docente. Verifica los datos.', 'error');
      }
    });
  }

  // === CARGA DE DATOS EXCEL ===
  cargarDesdeExcel(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      this.showToastMessage('Por favor selecciona un archivo', 'warning');
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      this.showToastMessage('Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV (.csv)', 'warning');
      return;
    }

    this.archivoSeleccionado = file;
    console.log('📁 Archivo seleccionado:', file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      this.procesarArchivoExcel(content, file.name);
    };
    reader.readAsText(file);
  }

  procesarArchivoExcel(content: string, fileName: string): void {
    try {
      console.log('📄 Procesando archivo:', fileName);
      
      // Limpiar líneas del CSV
      const lineas = limpiarLineasCSV(content);
      if (lineas.length < 2) {
        throw new Error('El archivo debe tener al menos una fila de encabezados y una fila de datos');
      }

      // Extraer encabezados
      const encabezados = extraerEncabezados(lineas);
      console.log('📋 Encabezados encontrados:', encabezados);

      // Procesar filas de datos
      const filas = procesarFilas(lineas.slice(1), encabezados);
      console.log('📄 Datos crudos leídos del CSV:', filas);

      // Transformar a formato de docente
      const errores: string[] = [];
      const docentesTransformados = filas
        .map(fila => transformarAFilaDocente(fila, errores, this.contratos, this.nivelesIngles, this.especializaciones, this.horariosDisponibles))
        .filter(Boolean);

      console.log('📋 Docentes transformados:', docentesTransformados);

      if (errores.length > 0) {
        console.warn('⚠️ Errores encontrados durante la transformación:', errores);
        this.showToastMessage(`Se encontraron ${errores.length} errores en el archivo:\n${errores.slice(0, 5).join('\n')}${errores.length > 5 ? '\n...' : ''}`, 'warning');
      }

      if (docentesTransformados.length === 0) {
        throw new Error('No se pudieron procesar docentes válidos del archivo');
      }

      this.docentesPendientes = docentesTransformados;
      this.mostrarModalConfirmacion = true;
      this.cerrarModalCargarDatos();
      
      console.log('✅ Archivo procesado:', this.docentesPendientes.length, 'docentes encontrados');
    } catch (error) {
      console.error('❌ Error procesando archivo:', error);
      this.showToastMessage(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
    }
  }

  confirmarCargaDocentes(): void {
    console.log('🚀 Confirmando carga de', this.docentesPendientes.length, 'docentes');
    
    let cargados = 0;
    let errores = 0;
    
    console.log('🚀 Iniciando carga de docentes:');
    console.log('📊 Total docentes a cargar:', this.docentesPendientes.length);
    console.log('📋 Primer docente a enviar:', this.docentesPendientes[0]);
    
    this.docentesPendientes.forEach((docente, index) => {
      console.log(`📤 Enviando docente ${index + 1}:`, docente);
      this.http.post('http://localhost:3000/docentes', docente).subscribe({
        next: () => {
          console.log(`✅ Docente ${index + 1} cargado exitosamente`);
          cargados++;
          if (cargados + errores === this.docentesPendientes.length) {
            this.finalizarCarga(cargados, errores);
          }
        },
        error: (err) => {
          console.error(`❌ Error al cargar docente ${index + 1}:`, err);
          console.error('📋 Datos del docente que falló:', docente);
          if (err.error && err.error.message) {
            console.error('🔍 Mensaje de error del backend:', err.error.message);
          }
          errores++;
          if (cargados + errores === this.docentesPendientes.length) {
            this.finalizarCarga(cargados, errores);
          }
        }
      });
    });
  }

  cancelarCargaDocentes(): void {
    this.mostrarModalConfirmacion = false;
    this.docentesPendientes = [];
    this.archivoSeleccionado = null;
  }

  private finalizarCarga(cargados: number, errores: number): void {
    this.mostrarModalConfirmacion = false;
    this.docentesPendientes = [];
    this.archivoSeleccionado = null;
    
    if (errores === 0) {
      this.showToastMessage(`✅ Se cargaron exitosamente ${cargados} docente(s).`, 'success');
    } else if (cargados === 0) {
      this.showToastMessage(`❌ No se pudo cargar ningún docente. Revisa la consola para más detalles.`, 'error');
    } else {
      this.showToastMessage(`⚠️ Se cargaron ${cargados} docente(s) y ${errores} fallaron. Revisa la consola para más detalles.`, 'warning');
    }
    
    // Recargar estadísticas
    this.cargarEstadisticas();
  }

  getContratoNombre(contratoId: string): string {
    const contrato = this.contratos.find(c => c.id === contratoId);
    return contrato ? contrato.nombre : 'N/A';
  }

  getNivelInglesNombre(nivelId: string): string {
    const nivel = this.nivelesIngles.find(n => n.id === nivelId);
    return nivel ? nivel.nombre : 'N/A';
  }
}
