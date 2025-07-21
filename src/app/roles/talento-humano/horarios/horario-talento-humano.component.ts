import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-horario-talento-humano',
  standalone: true,
  imports: [HeaderComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './horario-talento-humano.component.html',
  styleUrls: ['./horario-talento-humano.component.scss']
})
export class HorarioTalentoHumanoComponent implements OnInit {

  horarios: any[] = [];
  horariosFiltrados: any[] = [];
  cargando = true;
  error = false;

  // Variables para filtros
  textoBusqueda: string = '';
  filtroDia: string = 'Todos';
  filtroHora: string = 'Todos';

  // Variables para paginación
  horariosPorPagina: number = 10;
  paginaActual: number = 1;
  totalPaginas: number = 1;
  horariosPaginados: any[] = [];

  // Variables para modal de vista (solo lectura)
  mostrarModalVista: boolean = false;
  horarioSeleccionado: any = null;

  // Listas para filtros
  dias: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  horas: string[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    console.log('⏰ Componente Vista Horarios - Talento Humano cargado');
    this.generarHoras();
    this.cargarHorarios();
  }

  generarHoras() {
    for (let hora = 6; hora <= 22; hora++) {
      this.horas.push(`${hora.toString().padStart(2, '0')}:00`);
    }
  }

  cargarHorarios() {
    console.log('🚀 === CARGANDO HORARIOS DESDE SERVIDOR ===');
    this.cargando = true;
    this.error = false;
    
    console.log('🚀 Haciendo petición GET a: http://localhost:3000/horarios');
    
    this.http.get('http://localhost:3000/horarios').subscribe({
      next: (response: any) => {
        console.log('📦 === RESPUESTA DEL SERVIDOR ===');
        console.log('📦 Datos de horarios recibidos:', response);
        
        if (response.success && response.horarios) {
          this.horarios = response.horarios;
          console.log('📦 Horarios cargados del servidor:', this.horarios.length);
          this.filtrarHorarios();
        } else {
          console.error('❌ Error en la respuesta del servidor:', response);
          this.error = true;
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar horarios:', err);
        this.error = true;
        this.cargando = false;
      }
    });
  }

  filtrarHorarios(): void {
    console.log('🔍 Filtrando horarios...');
    console.log('📋 Total horarios:', this.horarios.length);
    
    this.horariosFiltrados = this.horarios.filter(horario => {
      return this.filtrarPorBusqueda(horario) &&
             this.filtrarPorDia(horario) &&
             this.filtrarPorHora(horario);
    });
    
    console.log('✅ Horarios filtrados:', this.horariosFiltrados.length);
    this.aplicarPaginacion();
  }

  filtrarPorBusqueda(horario: any): boolean {
    const texto = this.textoBusqueda.trim().toLowerCase();
    if (!texto) return true;
    
    const dia = horario.dia?.toLowerCase() || '';
    const horaInicio = horario.hora_inicio?.toLowerCase() || '';
    const horaFin = horario.hora_fin?.toLowerCase() || '';
    
    return dia.includes(texto) || 
           horaInicio.includes(texto) || 
           horaFin.includes(texto);
  }

  filtrarPorDia(horario: any): boolean {
    return this.filtroDia === 'Todos' || horario.dia === this.filtroDia;
  }

  filtrarPorHora(horario: any): boolean {
    return this.filtroHora === 'Todos' || horario.hora_inicio === this.filtroHora;
  }

  aplicarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.horariosPorPagina;
    const fin = inicio + this.horariosPorPagina;
    this.horariosPaginados = this.horariosFiltrados.slice(inicio, fin);
    this.totalPaginas = Math.ceil(this.horariosFiltrados.length / this.horariosPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.aplicarPaginacion();
    }
  }

  obtenerRangoPagina(): { inicio: number, fin: number, total: number } {
    const inicio = (this.paginaActual - 1) * this.horariosPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.horariosPorPagina, this.horariosFiltrados.length);
    return { inicio, fin, total: this.horariosFiltrados.length };
  }

  obtenerPaginasVisibles(): number[] {
    const paginas: number[] = [];
    const maxPaginas = 5;
    
    if (this.totalPaginas <= maxPaginas) {
      for (let i = 1; i <= this.totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginas / 2));
      let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
      
      if (fin - inicio + 1 < maxPaginas) {
        inicio = Math.max(1, fin - maxPaginas + 1);
      }
      
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }
    }
    
    return paginas;
  }

  resetearFiltros(): void {
    console.log('🔄 Reseteando filtros...');
    this.textoBusqueda = '';
    this.filtroDia = 'Todos';
    this.filtroHora = 'Todos';
    this.paginaActual = 1;
    this.filtrarHorarios();
  }

  // Método para ver horario (solo lectura)
  verHorario(index: number): void {
    this.horarioSeleccionado = this.horariosPaginados[index];
    this.mostrarModalVista = true;
    console.log('👁️ Viendo horario:', this.horarioSeleccionado);
  }

  cerrarModalVista(): void {
    this.mostrarModalVista = false;
    this.horarioSeleccionado = null;
  }

  // Métodos para formatear tiempo
  formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    return timeString;
  }

  getDiaClass(dia: string): string {
    const clases: { [key: string]: string } = {
      'Lunes': 'dia-lunes',
      'Martes': 'dia-martes',
      'Miércoles': 'dia-miercoles',
      'Jueves': 'dia-jueves',
      'Viernes': 'dia-viernes',
      'Sábado': 'dia-sabado',
      'Domingo': 'dia-domingo'
    };
    return clases[dia] || 'dia-default';
  }
}
