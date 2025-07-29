import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-aulas-coordinador',
  standalone: true,
  imports: [HeaderComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './aulas-coordinador.component.html',
  styleUrls: ['./aulas-coordinador.component.scss']
})
export class AulasCoordinadorComponent implements OnInit {

  aulas: any[] = [];
  aulasFiltradas: any[] = [];
  cargando = true;
  error = false;

  // Variables para filtros
  textoBusqueda: string = '';
  filtroPiso: string = 'Todos';
  filtroTipo: string = 'Todos';
  filtroEstado: string = 'Todos';
  filtroCapacidad: number = 0;

  // Variables para paginación
  aulasPorPagina: number = 10;
  paginaActual: number = 1;
  totalPaginas: number = 1;
  aulasPaginadas: any[] = [];

  // Variables para modal
  mostrarModalVista: boolean = false;
  aulaSeleccionada: any = null;

  // Modal de edición
  mostrarModalEdicion: boolean = false;
  aulaEditando: any = null;
  guardando: boolean = false;

  // Modal de crear aula
  mostrarModalCrearAula: boolean = false;
  nuevaAula: any = {
    numero: '',
    ubicacion: '',
    piso: '',
    tipo_aula: 'tiny_kids',
    edad_minima: 0,
    edad_maxima: 0,
    capacidad: 1,
    observaciones: ''
  };
  guardandoNuevaAula: boolean = false;

  // Vista de aulas eliminadas
  mostrarAulasEliminadas: boolean = false;
  aulasEliminadas: any[] = [];
  cargandoEliminadas: boolean = false;
  errorEliminadas: boolean = false;

  // Listas para filtros
  pisos: string[] = [];
  tipos: string[] = ['tiny_kids', 'children', 'teens', 'adults'];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarAulas();
    this.cargarAulasEliminadas(); // Cargar también las aulas inactivas para las estadísticas
  }

  cargarAulas() {
    this.cargando = true;
    this.error = false;
    
    this.http.get('http://localhost:3000/aulas').subscribe({
      next: (response: any) => {
        
        if (response.success && response.aulas) {
          this.aulas = response.aulas;
          
          // Debugging para aulas inactivas
          const aulasInactivas = this.aulas.filter(a => a.estado === false);
          
          // Buscar el aula que se editó para verificar si se actualizó
          if (this.aulaEditando) {
            const aulaEditada = this.aulas.find(a => a.id === this.aulaEditando.id);
            if (aulaEditada) {
              
            }
          }
          
          this.extraerPisos();
          this.filtrarAulas();
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

  extraerPisos() {
    const pisosUnicos = new Set<string>();
    this.aulas.forEach(aula => {
      if (aula.piso) {
        pisosUnicos.add(aula.piso);
      }
    });
    this.pisos = Array.from(pisosUnicos).sort();
  }

  // === FILTRADO Y PAGINACIÓN ===
  filtrarAulas(): void {
    
    this.aulasFiltradas = this.aulas.filter(aula => {
      return this.filtrarPorBusqueda(aula) &&
        this.filtrarPorPiso(aula) &&
        this.filtrarPorTipo(aula) &&
        this.filtrarPorEstado(aula) &&
        this.filtrarPorCapacidad(aula);
    });
    
    this.aplicarPaginacion();
  }

  filtrarPorBusqueda(aula: any): boolean {
    const texto = this.textoBusqueda.trim().toLowerCase();
    if (!texto) return true;
    
    const numeroAula = aula.numero?.toString().toLowerCase() || '';
    const piso = aula.piso?.toLowerCase() || '';
    const ubicacion = aula.ubicacion?.toLowerCase() || '';
    const observaciones = aula.observaciones?.toLowerCase() || '';
    
    return numeroAula.includes(texto) || 
           piso.includes(texto) || 
           ubicacion.includes(texto) ||
           observaciones.includes(texto);
  }

  filtrarPorPiso(aula: any): boolean {
    return this.filtroPiso === 'Todos' || aula.piso === this.filtroPiso;
  }

  filtrarPorTipo(aula: any): boolean {
    if (this.filtroTipo === 'Todos') return true;
    return aula.tipo_aula === this.filtroTipo;
  }

  filtrarPorEstado(aula: any): boolean {
    if (this.filtroEstado === 'Todos') return true;
    
    if (this.filtroEstado === 'Disponible') {
      return aula.disponible === true && aula.estado === true;
    } else if (this.filtroEstado === 'Ocupada') {
      return aula.disponible === false && aula.estado === true;
    } else if (this.filtroEstado === 'Inactiva') {
      return aula.estado === false;
    }
    
    return true;
  }

  filtrarPorCapacidad(aula: any): boolean {
    const capacidadMinima = Math.max(0, this.filtroCapacidad);
    if (capacidadMinima === 0) return true;
    return (aula.capacidad || 0) >= capacidadMinima;
  }

  validarCapacidadMinima(event: any): void {
    const valor = event.target.value;
    const numero = Number(valor);
    
    // Si el valor es negativo, establecerlo en 0
    if (numero < 0) {
      this.filtroCapacidad = 0;
      event.target.value = '0';
    } else {
      this.filtroCapacidad = numero;
    }
    
    // Aplicar filtros después de la validación
    this.filtrarAulas();
  }

  aplicarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.aulasPorPagina;
    const fin = inicio + this.aulasPorPagina;
    this.aulasPaginadas = this.aulasFiltradas.slice(inicio, fin);
    this.totalPaginas = Math.ceil(this.aulasFiltradas.length / this.aulasPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.aplicarPaginacion();
    }
  }

  obtenerRangoPagina(): { inicio: number, fin: number, total: number } {
    const inicio = (this.paginaActual - 1) * this.aulasPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.aulasPorPagina, this.aulasFiltradas.length);
    return { inicio, fin, total: this.aulasFiltradas.length };
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
    this.filtroPiso = 'Todos';
    this.filtroTipo = 'Todos';
    this.filtroEstado = 'Todos';
    this.filtroCapacidad = 0;
    this.paginaActual = 1;
    this.filtrarAulas();
  }

  // Propiedades computadas para las estadísticas
  get totalAulas(): number {
    return this.aulas.length;
  }

  get aulasDisponibles(): number {
    return this.aulas.filter(a => a.disponible === true).length;
  }

  get aulasOcupadas(): number {
    return this.aulas.filter(a => a.disponible === false).length;
  }

  get aulasInactivas(): number {
    // Las aulas inactivas están en la lista de aulasEliminadas
    const totalInactivas = this.aulasEliminadas.length;
    
    return totalInactivas;
  }

  getEstadoClass(disponible: boolean, estado: boolean): string {
    if (!estado) {
      return 'estado-mantenimiento';
    }
    return disponible ? 'estado-disponible' : 'estado-ocupada';
  }

  getEstadoTexto(disponible: boolean, estado: boolean): string {
    if (!estado) {
      return 'Mantenimiento';
    }
    return disponible ? 'Disponible' : 'Ocupada';
  }

  getTipoAula(tipoAula: string): string {
    switch (tipoAula) {
      case 'tiny_kids':
        return 'Tiny Kids';
      case 'children':
        return 'Children';
      case 'teens':
        return 'Teens';
      case 'adults':
        return 'Adults';
      default:
        return tipoAula;
    }
  }

  getTipoClass(tipoAula: string): string {
    switch (tipoAula) {
      case 'tiny_kids':
        return 'tipo-tiny-kids';
      case 'children':
        return 'tipo-children';
      case 'teens':
        return 'tipo-teens';
      case 'adults':
        return 'tipo-adults';
      default:
        return 'tipo-regular';
    }
  }

  getRangoEdad(aula: any): string {
    if (aula.edad_minima && aula.edad_maxima) {
      return `${aula.edad_minima} - ${aula.edad_maxima} años`;
    }
    return 'No especificado';
  }

  editarAula(aula: any): void {
    
    // Crear una copia profunda del aula para editar
    this.aulaEditando = {
      id: aula.id,
      numero: aula.numero,
      ubicacion: aula.ubicacion || '',
      piso: aula.piso || '',
      capacidad: aula.capacidad || 0,
      tipo_aula: aula.tipo_aula || 'tiny_kids',
      edad_minima: aula.edad_minima || 0,
      edad_maxima: aula.edad_maxima || 0,
      disponible: aula.disponible === true,
      estado: aula.estado === true,
      observaciones: aula.observaciones || ''
    };
    
    this.mostrarModalEdicion = true;
  }

  cerrarModalEdicion(): void {
    this.mostrarModalEdicion = false;
    this.aulaEditando = null;
    this.guardando = false;
  }

  guardarAula(): void {
    
    // Mostrar confirmación antes de guardar
    const confirmacion = confirm('¿Estás seguro de que quieres guardar los cambios en el aula?');
    if (!confirmacion) {
      return;
    }
    
    this.guardando = true;
    
    // Preparar datos según el DTO UpdateAulaDto
    const datosAula = {
      id: this.aulaEditando.id,
      numero: String(this.aulaEditando.numero), // Convertir a string como espera el DTO
      ubicacion: this.aulaEditando.ubicacion,
      piso: this.aulaEditando.piso,
      capacidad: Number(this.aulaEditando.capacidad),
      tipo_aula: this.aulaEditando.tipo_aula,
      edad_minima: Number(this.aulaEditando.edad_minima),
      edad_maxima: Number(this.aulaEditando.edad_maxima),
      disponible: this.convertirABoolean(this.aulaEditando.disponible),
      estado: this.convertirABoolean(this.aulaEditando.estado),
      observaciones: this.aulaEditando.observaciones
    };
    
    this.http.patch('http://localhost:3000/aulas', datosAula).subscribe({
      next: (response: any) => {
        
        // Actualizar la lista local correctamente
        const index = this.aulas.findIndex(a => a.id === this.aulaEditando.id);
        
        if (index !== -1) {
          
          // Actualizar solo los campos que se enviaron
          this.aulas[index] = {
            ...this.aulas[index],
            ...datosAula
          };
          
          this.filtrarAulas(); // Reaplicar filtros
        } else {
          // Si no está en la lista de aulas activas, puede estar en eliminadas
          const indexEliminadas = this.aulasEliminadas.findIndex(a => a.id === this.aulaEditando.id);
          if (indexEliminadas !== -1) {
            
            this.aulasEliminadas[indexEliminadas] = {
              ...this.aulasEliminadas[indexEliminadas],
              ...datosAula
            };
            
            // Si el aula se activó (estado = true), removerla de la lista de eliminadas
            if (datosAula.estado === true) {
              
              this.aulasEliminadas = this.aulasEliminadas.filter(a => a.id !== this.aulaEditando.id);
            }
          }
        }
        
        this.cerrarModalEdicion();
        
        // Recargar datos desde el servidor para asegurar sincronización
        setTimeout(() => {
          
          // Recargar aulas activas primero
          this.cargarAulas();
          
          // Luego recargar aulas eliminadas
          setTimeout(() => {
            this.cargarAulasEliminadas();
          }, 200);
        }, 500);
        
        // Mostrar mensaje de confirmación
        this.mostrarMensajeExito('Aula actualizada correctamente');
      },
      error: (err) => {
        this.guardando = false;
        
        // Mostrar mensaje de error más específico
        const mensajeError = err.error?.message || err.message || 'Error al actualizar el aula';
        this.mostrarMensajeError(mensajeError);
      }
    });
  }

  // Métodos para mostrar mensajes
  mostrarMensajeExito(mensaje: string): void {
    // Crear un elemento de mensaje temporal
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
    
    // Remover después de 3 segundos
    setTimeout(() => {
      if (mensajeElement.parentNode) {
        mensajeElement.parentNode.removeChild(mensajeElement);
      }
    }, 3000);
  }

  mostrarMensajeError(mensaje: string): void {
    // Crear un elemento de mensaje temporal
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
    
    // Remover después de 3 segundos
    setTimeout(() => {
      if (mensajeElement.parentNode) {
        mensajeElement.parentNode.removeChild(mensajeElement);
      }
    }, 3000);
  }

  verAula(index: number): void {
    this.aulaSeleccionada = this.aulasPaginadas[index];
    this.mostrarModalVista = true;
  }

  cerrarModalVista(): void {
    this.mostrarModalVista = false;
    this.aulaSeleccionada = null;
  }

  // === MÉTODOS PARA AULAS ELIMINADAS ===
  cargarAulasEliminadas() {
    this.cargandoEliminadas = true;
    this.errorEliminadas = false;
    
    this.http.get('http://localhost:3000/aulas/eliminadas').subscribe({
      next: (response: any) => {
        
                  if (response.success && response.aulas) {
            this.aulasEliminadas = response.aulas;
            
            // Actualizar estadísticas después de cargar aulas eliminadas
            this.actualizarEstadisticas();
          } else {
          this.errorEliminadas = true;
        }
        
        this.cargandoEliminadas = false;
      },
      error: (err) => {
        this.errorEliminadas = true;
        this.cargandoEliminadas = false;
      }
    });
  }

  cambiarVistaAulas() {
    this.mostrarAulasEliminadas = !this.mostrarAulasEliminadas;
    
    if (this.mostrarAulasEliminadas) {
      this.cargarAulasEliminadas();
    } else {
      this.cargarAulas(); // Recargar aulas activas
    }
    
    // Limpiar filtros al cambiar vista
    this.resetearFiltros();
  }

  eliminarAula(aula: any): void {
    
    // Mostrar confirmación antes de eliminar
    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar el aula ${aula.numero}? Esta acción no se puede deshacer.`);
    if (!confirmacion) {
      return;
    }
    
    const datosEliminacion = {
      estado: false
    };
    
    this.http.delete(`http://localhost:3000/aulas/${aula.id}`, { body: datosEliminacion }).subscribe({
      next: (response: any) => {
        
        // Remover de la lista local
        this.aulas = this.aulas.filter(a => a.id !== aula.id);
        this.filtrarAulas();
        
        // Recargar la lista de aulas eliminadas para actualizar el contador
        this.cargarAulasEliminadas();
        
        // Mostrar mensaje de éxito
        this.mostrarMensajeExito('Aula eliminada correctamente');
      },
      error: (err) => {
        this.mostrarMensajeError('Error al eliminar el aula');
      }
    });
  }

  restaurarAula(aula: any): void {
    
    // Mostrar confirmación antes de restaurar
    const confirmacion = confirm(`¿Estás seguro de que quieres restaurar el aula ${aula.numero}?`);
    if (!confirmacion) {
      return;
    }
    
    const datosRestauracion = {
      estado: true
    };
    
    // URL correcta para restaurar aulas
    const urlRestaurar = `http://localhost:3000/aulas/${aula.id}/restaurar`;
    this.http.patch(urlRestaurar, datosRestauracion).subscribe({
      next: (response: any) => {
        
        // Remover de la lista de eliminadas inmediatamente
        const aulasAntes = this.aulasEliminadas.length;
        this.aulasEliminadas = this.aulasEliminadas.filter(a => a.id !== aula.id);
        const aulasDespues = this.aulasEliminadas.length;
        
        // Recargar aulas activas
        this.cargarAulas();
        
        // Actualizar estadísticas
        this.actualizarEstadisticas();
        
        // Mostrar mensaje de éxito
        this.mostrarMensajeExito('Aula restaurada correctamente');
      },
      error: (err) => {
        this.mostrarMensajeError('Error al restaurar el aula');
      }
    });
  }

  editarAulaEliminada(aula: any): void {
    
    // Preparar datos para edición
    this.aulaEditando = {
      id: aula.id,
      numero: aula.numero,
      ubicacion: aula.ubicacion || '',
      piso: aula.piso || '',
      capacidad: aula.capacidad || 0,
      tipo_aula: aula.tipo_aula || 'tiny_kids',
      edad_minima: aula.edad_minima || 0,
      edad_maxima: aula.edad_maxima || 0,
      disponible: aula.disponible,
      estado: aula.estado, // Permitir cambiar el estado
      observaciones: aula.observaciones || ''
    };
    
    this.mostrarModalEdicion = true;
  }

  verAulaEliminada(index: number): void {
    this.aulaSeleccionada = this.aulasEliminadas[index];
    this.mostrarModalVista = true;
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

  actualizarEstadisticas(): void {
    // Forzar la detección de cambios en Angular
    // Esto asegura que las propiedades computadas se actualicen en la UI
    setTimeout(() => {
      // Angular debería detectar automáticamente los cambios, pero el setTimeout ayuda
    }, 100);
  }

  // === MÉTODOS PARA CREAR AULA ===
  mostrarModalAgregarAula(): void {
    this.mostrarModalCrearAula = true;
    this.cdr.detectChanges();
  }

  cerrarModalCrearAula(): void {
    this.mostrarModalCrearAula = false;
    this.limpiarFormularioNuevaAula();
    this.cdr.detectChanges();
  }

  limpiarFormularioNuevaAula(): void {
    this.nuevaAula = {
      numero: '',
      ubicacion: '',
      piso: '',
      tipo_aula: 'tiny_kids',
      edad_minima: 0,
      edad_maxima: 0,
      capacidad: 1,
      observaciones: ''
    };
  }

  crearAula(): void {
    if (!this.validarFormularioNuevaAula()) {
      return;
    }

    this.guardandoNuevaAula = true;

    // Preparar datos según el DTO CreateAulaDto
    const datosAula = {
      numero: Number(this.nuevaAula.numero),
      ubicacion: this.nuevaAula.ubicacion,
      piso: this.nuevaAula.piso,
      tipo_aula: this.nuevaAula.tipo_aula,
      edad_minima: Number(this.nuevaAula.edad_minima),
      edad_maxima: Number(this.nuevaAula.edad_maxima),
      capacidad: Number(this.nuevaAula.capacidad),
      observaciones: this.nuevaAula.observaciones || ''
    };

    console.log('📤 JSON a enviar al crear aula:', JSON.stringify(datosAula, null, 2));
    console.log('📋 Objeto datosAula completo:', datosAula);

    this.http.post('http://localhost:3000/aulas', datosAula).subscribe({
      next: (response: any) => {
        this.guardandoNuevaAula = false;
        
        if (response.success) {
          this.cerrarModalCrearAula();
          
          // Recargar la lista de aulas
          this.cargarAulas();
          
          // Mostrar mensaje de éxito
          this.mostrarMensajeExito('Aula creada correctamente');
        } else {
          this.mostrarMensajeError(response.message || 'Error al crear el aula');
        }
      },
      error: (err) => {
        this.guardandoNuevaAula = false;
        
        const mensajeError = err.error?.message || err.message || 'Error al crear el aula';
        this.mostrarMensajeError(mensajeError);
      }
    });
  }

  validarFormularioNuevaAula(): boolean {
    if (!this.nuevaAula.numero || !this.nuevaAula.ubicacion || !this.nuevaAula.piso) {
      this.mostrarMensajeError('Por favor complete todos los campos obligatorios');
      return false;
    }

    if (this.nuevaAula.capacidad < 1) {
      this.mostrarMensajeError('La capacidad debe ser mayor a 0');
      return false;
    }

    if (this.nuevaAula.edad_minima < 0 || this.nuevaAula.edad_maxima < 0) {
      this.mostrarMensajeError('Las edades no pueden ser negativas');
      return false;
    }

    if (this.nuevaAula.edad_minima > this.nuevaAula.edad_maxima) {
      this.mostrarMensajeError('La edad mínima no puede ser mayor que la edad máxima');
      return false;
    }

    return true;
  }
} 