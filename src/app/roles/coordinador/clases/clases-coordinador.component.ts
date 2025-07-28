import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CatalogoService } from '../../../services/catalogo.service';

@Component({
  selector: 'app-clases-coordinador',
  standalone: true,
  imports: [HeaderComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './clases-coordinador.component.html',
  styleUrls: ['./clases-coordinador.component.scss']
})
export class ClasesCoordinadorComponent implements OnInit {

  clases: any[] = [];
  clasesFiltradas: any[] = [];
  cargando = true;
  error = false;

  // Variables para filtros
  textoBusqueda: string = '';
  filtroEstado: string = 'Todos';
  filtroCategoria: string = 'Todos';
  filtroPrioridadMin: number = 0;
  filtroPrioridadMax: number = 10;

  // Variables para paginación
  clasesPorPagina: number = 10;
  paginaActual: number = 1;
  totalPaginas: number = 1;
  clasesPaginadas: any[] = [];

  // Variables para modal
  mostrarModalVista: boolean = false;
  claseSeleccionada: any = null;

  // Modal de edición
  mostrarModalEdicion: boolean = false;
  claseEditando: any = null;
  guardando: boolean = false;

  // Modal de creación
  mostrarModalCreacion: boolean = false;
  nuevaClase: any = null;
  creando: boolean = false;

  // Listas para filtros
  categorias: string[] = [];
  estados: string[] = ['PENDIENTE', 'ASIGNADO', 'CANCELADO'];
  programas: any[] = [];

  constructor(private http: HttpClient, private catalogoService: CatalogoService) { }

  ngOnInit(): void {
    this.cargarProgramas();
    this.cargarClases();
  }

  cargarClases() {
    this.cargando = true;
    this.error = false;
    
    this.http.get('http://localhost:3000/clases').subscribe({
      next: (response: any) => {
        
        if (response.success && response.clases) {
          this.clases = response.clases;
          
          this.extraerCategorias();
          this.filtrarClases();
          this.actualizarEstadisticas();
          
        } else {
          this.error = true;
        }
        
        this.cargando = false;
      },
      error: (err) => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  cargarProgramas() {
    this.catalogoService.getProgramas().subscribe({
      next: (res: any) => {
        this.programas = res.programas || [];
      },
      error: (err) => {
        // Si falla la petición, simular algunos programas
        this.programas = [
          { id: '123e4567-e89b-12d3-a456-426614174000', nombre: 'Inglés Kids' },
          { id: '456e7890-e89b-12d3-a456-426614174000', nombre: 'Inglés Teens' },
          { id: '789e1234-e89b-12d3-a456-426614174000', nombre: 'Inglés Adults' }
        ];
      }
    });
  }

  extraerCategorias() {
    const categoriasUnicas = new Set<string>();
    this.clases.forEach(clase => {
      if (clase.programa && clase.programa.categoria) {
        categoriasUnicas.add(clase.programa.categoria);
      }
    });
    this.categorias = Array.from(categoriasUnicas).sort();
  }

  // === FILTRADO Y PAGINACIÓN ===
  filtrarClases(): void {
    
    this.clasesFiltradas = this.clases.filter(clase => {
      return this.filtrarPorBusqueda(clase) &&
        this.filtrarPorEstado(clase) &&
        this.filtrarPorCategoria(clase) &&
        this.filtrarPorPrioridad(clase);
    });
    
    this.aplicarPaginacion();
  }

  filtrarPorBusqueda(clase: any): boolean {
    const texto = this.textoBusqueda.trim().toLowerCase();
    if (!texto) return true;
    
    const programaNombre = clase.programa?.nombre?.toLowerCase() || '';
    const programaCategoria = clase.programa?.categoria?.toLowerCase() || '';
    const paralelo = clase.paralelo?.toLowerCase() || '';
    const horario = clase.horario_solicitado?.toLowerCase() || '';
    const observaciones = clase.observaciones?.toLowerCase() || '';
    
    return programaNombre.includes(texto) || 
           programaCategoria.includes(texto) || 
           paralelo.includes(texto) ||
           horario.includes(texto) ||
           observaciones.includes(texto);
  }

  filtrarPorEstado(clase: any): boolean {
    return this.filtroEstado === 'Todos' || clase.estado === this.filtroEstado;
  }

  filtrarPorCategoria(clase: any): boolean {
    return this.filtroCategoria === 'Todos' || clase.programa?.categoria === this.filtroCategoria;
  }

  filtrarPorPrioridad(clase: any): boolean {
    const prioridad = clase.prioridad || 0;
    return prioridad >= this.filtroPrioridadMin && prioridad <= this.filtroPrioridadMax;
  }

  validarPrioridad(event: any, tipo: 'min' | 'max'): void {
    const valor = event.target.value;
    const numero = Number(valor);
    
    if (tipo === 'min') {
      if (numero < 0) {
        this.filtroPrioridadMin = 0;
        event.target.value = '0';
      } else {
        this.filtroPrioridadMin = numero;
      }
    } else {
      if (numero < 0) {
        this.filtroPrioridadMax = 10;
        event.target.value = '10';
      } else {
        this.filtroPrioridadMax = numero;
      }
    }
    
    this.filtrarClases();
  }

  aplicarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.clasesPorPagina;
    const fin = inicio + this.clasesPorPagina;
    this.clasesPaginadas = this.clasesFiltradas.slice(inicio, fin);
    this.totalPaginas = Math.ceil(this.clasesFiltradas.length / this.clasesPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.aplicarPaginacion();
    }
  }

  obtenerRangoPagina(): { inicio: number, fin: number, total: number } {
    const inicio = (this.paginaActual - 1) * this.clasesPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.clasesPorPagina, this.clasesFiltradas.length);
    return { inicio, fin, total: this.clasesFiltradas.length };
  }

  obtenerPaginasVisibles(): number[] {
    const paginas: number[] = [];
    const maxPaginas = 5;
    
    if (this.totalPaginas <= maxPaginas) {
      for (let i = 1; i <= this.totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      let inicio = Math.max(1, this.paginaActual - 2);
      let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
      
      if (fin - inicio < maxPaginas - 1) {
        inicio = Math.max(1, fin - maxPaginas + 1);
      }
      
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }
    }
    
    return paginas;
  }

  resetearFiltros(): void {
    this.textoBusqueda = '';
    this.filtroEstado = 'Todos';
    this.filtroCategoria = 'Todos';
    this.filtroPrioridadMin = 0;
    this.filtroPrioridadMax = 10;
    this.paginaActual = 1;
    this.filtrarClases();
  }

  // Propiedades computadas para las estadísticas
  get totalClases(): number {
    return this.clases.length;
  }

  get clasesPendientes(): number {
    return this.clases.filter(c => c.estado === 'PENDIENTE').length;
  }

  get clasesAsignadas(): number {
    return this.clases.filter(c => c.estado === 'ASIGNADO').length;
  }

  get clasesCanceladas(): number {
    return this.clases.filter(c => c.estado === 'CANCELADO').length;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'estado-pendiente';
      case 'ASIGNADO':
        return 'estado-asignado';
      case 'CANCELADO':
        return 'estado-cancelado';
      default:
        return 'estado-regular';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return '⏳ Pendiente';
      case 'ASIGNADO':
        return '✅ Asignado';
      case 'CANCELADO':
        return '❌ Cancelado';
      default:
        return estado;
    }
  }

  getCategoriaClass(categoria: string): string {
    switch (categoria) {
      case 'Tiny Kids':
        return 'categoria-tiny-kids';
      case 'Children':
        return 'categoria-children';
      case 'Teens':
        return 'categoria-teens';
      case 'Youth':
        return 'categoria-youth';
      case 'Adults':
        return 'categoria-adults';
      default:
        return 'categoria-regular';
    }
  }

  getPrioridadClass(prioridad: number): string {
    if (prioridad >= 8) return 'prioridad-alta';
    if (prioridad >= 5) return 'prioridad-media';
    return 'prioridad-baja';
  }

  // === MÉTODOS PARA VER CLASE ===
  verClase(index: number): void {
    this.claseSeleccionada = this.clasesPaginadas[index];
    this.mostrarModalVista = true;
  }

  cerrarModalVista(): void {
    this.mostrarModalVista = false;
    this.claseSeleccionada = null;
  }

  // === MÉTODOS PARA EDITAR CLASE ===
  editarClase(clase: any): void {
    
    this.claseEditando = {
      id: clase.id,
      programa_id: clase.programa_id,
      cupos_proyectados: clase.cupos_proyectados,
      horario_solicitado: clase.horario_solicitado,
      paralelo: clase.paralelo,
      estado: clase.estado,
      prioridad: clase.prioridad,
      observaciones: clase.observaciones || ''
    };
    
    this.mostrarModalEdicion = true;
  }

  cerrarModalEdicion(): void {
    this.mostrarModalEdicion = false;
    this.claseEditando = null;
    this.guardando = false;
  }

  guardarClase(): void {
    
    const confirmacion = confirm('¿Estás seguro de que quieres guardar los cambios en la clase?');
    if (!confirmacion) {
      return;
    }
    
    this.guardando = true;
    
    this.http.patch('http://localhost:3000/clases', this.claseEditando).subscribe({
      next: (response: any) => {
        
        // Actualizar la lista local
        const index = this.clases.findIndex(c => c.id === this.claseEditando.id);
        if (index !== -1) {
          this.clases[index] = {
            ...this.clases[index],
            ...this.claseEditando
          };
          this.filtrarClases();
        }
        
        this.cerrarModalEdicion();
        this.mostrarMensajeExito('Clase actualizada correctamente');
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarMensajeError('Error al actualizar la clase');
      }
    });
  }

  // === MÉTODOS PARA CREAR CLASE ===
  abrirModalCreacion(): void {
    
    this.nuevaClase = {
      programa_id: '',
      cupos_proyectados: 10,
      horario_solicitado: '',
      paralelo: 'A',
      estado: 'PENDIENTE',
      prioridad: 5,
      observaciones: ''
    };
    
    this.mostrarModalCreacion = true;
  }

  cerrarModalCreacion(): void {
    this.mostrarModalCreacion = false;
    this.nuevaClase = null;
    this.creando = false;
  }

  crearClase(): void {
    
    const confirmacion = confirm('¿Estás seguro de que quieres crear esta nueva clase?');
    if (!confirmacion) {
      return;
    }
    
    this.creando = true;
    
    this.http.post('http://localhost:3000/clases', this.nuevaClase).subscribe({
      next: (response: any) => {
        
        // Agregar a la lista local
        if (response.success && response.clase) {
          this.clases.unshift(response.clase);
          this.filtrarClases();
        }
        
        this.cerrarModalCreacion();
        this.mostrarMensajeExito('Clase creada correctamente');
      },
      error: (err) => {
        this.creando = false;
        this.mostrarMensajeError('Error al crear la clase');
      }
    });
  }

  // === MÉTODOS PARA ELIMINAR CLASE ===
  eliminarClase(clase: any): void {
    
    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar la clase ${clase.programa?.nombre} - Paralelo ${clase.paralelo}? Esta acción no se puede deshacer.`);
    if (!confirmacion) {
      return;
    }
    
    this.http.delete(`http://localhost:3000/clases/${clase.id}`).subscribe({
      next: (response: any) => {
        
        // Remover de la lista local
        this.clases = this.clases.filter(c => c.id !== clase.id);
        this.filtrarClases();
        
        this.mostrarMensajeExito('Clase eliminada correctamente');
      },
      error: (err) => {
        this.mostrarMensajeError('Error al eliminar la clase');
      }
    });
  }

  // === MÉTODOS PARA MOSTRAR MENSAJES ===
  mostrarMensajeExito(mensaje: string): void {
    const mensajeElement = document.createElement('div');
    mensajeElement.className = 'mensaje-exito';
    mensajeElement.textContent = mensaje;
    mensajeElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #d4edda;
      color: #155724;
      padding: 15px 20px;
      border-radius: 8px;
      border: 1px solid #c3e6cb;
      z-index: 9999;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(mensajeElement);
    
    setTimeout(() => {
      if (mensajeElement.parentNode) {
        mensajeElement.parentNode.removeChild(mensajeElement);
      }
    }, 3000);
  }

  mostrarMensajeError(mensaje: string): void {
    const mensajeElement = document.createElement('div');
    mensajeElement.className = 'mensaje-error';
    mensajeElement.textContent = mensaje;
    mensajeElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f8d7da;
      color: #721c24;
      padding: 15px 20px;
      border-radius: 8px;
      border: 1px solid #f5c6cb;
      z-index: 9999;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(mensajeElement);
    
    setTimeout(() => {
      if (mensajeElement.parentNode) {
        mensajeElement.parentNode.removeChild(mensajeElement);
      }
    }, 3000);
  }

  actualizarEstadisticas(): void {
    
  }
} 