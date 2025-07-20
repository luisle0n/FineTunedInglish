import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  standalone: true,
  selector: 'app-inicio-coordinador',
  templateUrl: './inicio-talento-humano.component.html',
  styleUrls: ['./inicio-talento-humano.component.scss'],
  imports: [CommonModule, FormsModule, HeaderComponent]
})

export class InicioTalentoHuemanoComponent implements OnInit {
  // Variables para modales
  mostrarModalNuevoDocente = false;
  mostrarModalCargarDatos = false;
  mostrarModalGenerarHorario = false;
  mostrarModalConfirmacion = false;

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

  constructor(private router: Router, private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarEstadisticas();
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

  guardarDocente() {
    console.log('💾 Guardando docente:', this.nuevoDocente);
    
    // Aquí iría la lógica para guardar el docente
    // Por ahora solo cerramos el modal
    this.cerrarModalNuevoDocente();
    alert('Docente guardado exitosamente');
  }

  // === CARGA DE DATOS EXCEL ===
  cargarDesdeExcel(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      alert('Por favor selecciona un archivo');
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      alert('Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV (.csv)');
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
      // Simular procesamiento de datos
      // En una implementación real, aquí se usarían las utilidades de excel-utils
      const docentesSimulados = [
        {
          primer_nombre: 'Juan',
          segundo_nombre: '',
          primer_apellido: 'Pérez',
          segundo_apellido: '',
          cedula: '1234567890',
          correo: 'juan.perez@email.com',
          telefono: '0991234567',
          tipo_contrato_id: this.contratos[0]?.id || '',
          experiencia_anios: 5,
          nivel_ingles_id: this.nivelesIngles[0]?.id || '',
          horas_disponibles: 20
        },
        {
          primer_nombre: 'María',
          segundo_nombre: '',
          primer_apellido: 'García',
          segundo_apellido: '',
          cedula: '0987654321',
          correo: 'maria.garcia@email.com',
          telefono: '0997654321',
          tipo_contrato_id: this.contratos[0]?.id || '',
          experiencia_anios: 3,
          nivel_ingles_id: this.nivelesIngles[1]?.id || '',
          horas_disponibles: 15
        }
      ];

      this.docentesPendientes = docentesSimulados;
      this.mostrarModalConfirmacion = true;
      this.cerrarModalCargarDatos();
      
      console.log('✅ Archivo procesado:', this.docentesPendientes.length, 'docentes encontrados');
    } catch (error) {
      console.error('❌ Error procesando archivo:', error);
      alert('Error al procesar el archivo. Verifica que el formato sea correcto.');
    }
  }

  confirmarCargaDocentes(): void {
    console.log('🚀 Confirmando carga de', this.docentesPendientes.length, 'docentes');
    
    // Aquí iría la lógica para guardar los docentes en la base de datos
    // Por ahora solo simulamos la carga
    
    let cargados = 0;
    let errores = 0;
    
    this.docentesPendientes.forEach((docente, index) => {
      try {
        // Simular guardado exitoso
        console.log('💾 Guardando docente:', docente.primer_nombre, docente.primer_apellido);
        cargados++;
      } catch (error) {
        console.error('❌ Error guardando docente:', error);
        errores++;
      }
    });
    
    this.finalizarCarga(cargados, errores);
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
      alert(`✅ Se cargaron exitosamente ${cargados} docentes`);
    } else {
      alert(`⚠️ Se cargaron ${cargados} docentes. ${errores} docentes tuvieron errores.`);
    }
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
