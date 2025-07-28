import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { limpiarLineasCSV, extraerEncabezados, procesarFilas, transformarAFilaDocente } from '../../../../utils/excel-utils';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastNotificationComponent } from '../../../shared/components/toast-notification/toast-notification.component';


@Component({
    selector: 'app-talento-humano-coordinador',
    standalone: true,
    templateUrl: './docente-talento-humano.component.html',
    styleUrls: ['./docente-talento-humano.component.scss'],
    imports: [HeaderComponent, CommonModule, FormsModule, ToastNotificationComponent]
})
export class DocenteTalentoHumanoComponent implements OnInit {
    contratos: any[] = [];
    nivelesIngles: any[] = [];
    especializaciones: any[] = [];
    horariosDisponibles: any[] = [];

    docentes: any[] = [];
    docentesFiltrados: any[] = [];
    docentesInactivos: any[] = [];
    docentesInactivosFiltrados: any[] = [];
    mostrarInactivos: boolean = false;


    mostrarModal: boolean = false;
    mostrarModalConfirmacion: boolean = false;
    mostrarModalVista: boolean = false;
    modoEdicionVista: boolean = false;
    textoBusqueda: string = '';
    filtroContrato: string = 'Todos';
    filtroNivelIngles: string = 'Todos';
    filtroExperiencia: number = 0;

    editIndex: number | null = null;
    docentesPendientes: any[] = [];
    docenteSeleccionado: any = null;
    docenteEdicionVista: any = null;
    
    // Variables para paginación
    docentesPorPagina: number = 10;
    paginaActual: number = 1;
    totalPaginas: number = 1;
    docentesPaginados: any[] = [];

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

    // Toast properties
    showToast = false;
    toastMessage = '';
    toastType: 'success' | 'error' | 'info' | 'warning' = 'success';

    constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

    ngOnInit(): void {
        this.cargarCatalogos().then(() => {
            this.cargarDocentes();
        });
    }



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

    cargarDocentes() {
        console.log('📥 Cargando docentes desde la API...');
        this.http.get<any[]>('http://localhost:3000/docentes').subscribe(data => {
            this.procesarDocentesActivos(data);
            // Aplicar filtros y paginación después de cargar los datos
            this.filtrarDocentes();
        });
    }

    // Método auxiliar para procesar docentes activos
    private procesarDocentesActivos(data: any[]) {
        console.log('📦 Datos recibidos de la API:', data.length, 'docentes');
        this.docentes = data.map(docente => {
            // Mapear ids de especializaciones por nombre si no hay id
            const especIds = (docente.especializaciones || []).map((e: any) => {
                if (e.especializacion_id) return e.especializacion_id;
                if (e.especializacion?.id) return e.especializacion.id;
                if (e.especializacion?.nombre) {
                    const found = this.especializaciones.find(es => es.nombre === e.especializacion.nombre);
                    return found ? found.id : null;
                }
                return null;
            }).filter(Boolean);

            const tipoContratoId = this.contratos.find(c => c.nombre === docente.tipo_contrato?.nombre)?.id || '';
            const nivelInglesId = this.nivelesIngles.find(n => n.nombre === docente.nivel_ingles?.nombre)?.id || '';
            return {
                ...docente,
                editValues: {
                    correo: docente.persona?.correo,
                    telefono: docente.persona?.telefono,
                    tipo_contrato_id: tipoContratoId,
                    experiencia_anios: docente.experiencia_anios,
                    nivel_ingles_id: nivelInglesId,
                    horas_disponibles: docente.horas_disponibles,
                    horas_asignadas: docente.horas_asignadas || 0,
                    max_horas_semanales: docente.max_horas_semanales || 30,
                    especializaciones: especIds
                },
                backup: null // para cancelar edición
            };
        });
        
        console.log('🔄 Docentes procesados:', this.docentes.length);
    }

    cargarDocentesInactivos() {
        console.log('📥 Cargando docentes inactivos desde la API...');
        this.http.get<any[]>('http://localhost:3000/docentes/inactivos').subscribe(data => {
            this.procesarDocentesInactivos(data);
            // Aplicar filtros y paginación después de cargar los datos
            this.filtrarDocentesInactivos();
        });
    }

    // Método auxiliar para procesar docentes inactivos
    private procesarDocentesInactivos(data: any[]) {
        console.log('📦 Datos recibidos de la API (inactivos):', data.length, 'docentes');
        this.docentesInactivos = data.map(docente => {
            // Mapear ids de especializaciones por nombre si no hay id
            const especIds = (docente.especializaciones || []).map((e: any) => {
                if (e.especializacion_id) return e.especializacion_id;
                if (e.especializacion?.id) return e.especializacion.id;
                if (e.especializacion?.nombre) {
                    const found = this.especializaciones.find(es => es.nombre === e.especializacion.nombre);
                    return found ? found.id : null;
                }
                return null;
            }).filter(Boolean);

            const tipoContratoId = this.contratos.find(c => c.nombre === docente.tipo_contrato?.nombre)?.id || '';
            const nivelInglesId = this.nivelesIngles.find(n => n.nombre === docente.nivel_ingles?.nombre)?.id || '';
            return {
                ...docente,
                editValues: {
                    correo: docente.persona?.correo,
                    telefono: docente.persona?.telefono,
                    tipo_contrato_id: tipoContratoId,
                    experiencia_anios: docente.experiencia_anios,
                    nivel_ingles_id: nivelInglesId,
                    horas_disponibles: docente.horas_disponibles,
                    horas_asignadas: docente.horas_asignadas || 0,
                    max_horas_semanales: docente.max_horas_semanales || 30,
                    especializaciones: especIds
                },
                backup: null // para cancelar edición
            };
        });
        
        console.log('🔄 Docentes inactivos procesados:', this.docentesInactivos.length);
    }

    abrirModal() {
        this.mostrarModal = true;
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

    cerrarModal() {
        this.mostrarModal = false;
    }

    cerrarModalVista() {
        this.mostrarModalVista = false;
        this.docenteSeleccionado = null;
        this.docenteEdicionVista = null;
        this.modoEdicionVista = false;
    }

    prepararDatosEdicion() {
        if (!this.docenteSeleccionado) return;
        
        console.log('🔍 Preparando datos de edición para:', this.docenteSeleccionado);
        
        // Obtener IDs de especializaciones - manejar múltiples formatos
        const especIds: string[] = [];
        if (this.docenteSeleccionado.especializaciones && Array.isArray(this.docenteSeleccionado.especializaciones)) {
            this.docenteSeleccionado.especializaciones.forEach((e: any) => {
                let id = null;
                
                // Diferentes formatos posibles
                if (e.especializacion_id) {
                    id = e.especializacion_id;
                } else if (e.especializacion?.id) {
                    id = e.especializacion.id;
                } else if (e.id) {
                    id = e.id;
                } else if (e.especializacion?.nombre) {
                    // Buscar por nombre si no hay ID
                    const found = this.especializaciones.find(es => es.nombre === e.especializacion.nombre);
                    id = found ? found.id : null;
                } else if (e.nombre) {
                    // Buscar por nombre directo
                    const found = this.especializaciones.find(es => es.nombre === e.nombre);
                    id = found ? found.id : null;
                }
                
                if (id && !especIds.includes(id)) {
                    especIds.push(id);
                }
            });
        }
        
        console.log('📚 Especializaciones encontradas:', especIds);
        
        // Obtener IDs de horarios - manejar múltiples formatos
        const horarioIds: string[] = [];
        if (this.docenteSeleccionado.horarios && Array.isArray(this.docenteSeleccionado.horarios)) {
            this.docenteSeleccionado.horarios.forEach((h: any) => {
                let id = null;
                
                // Diferentes formatos posibles
                if (h.horario_id) {
                    id = h.horario_id;
                } else if (h.horario?.id) {
                    id = h.horario.id;
                } else if (h.id) {
                    id = h.id;
                } else if (h.horario?.dia && h.horario?.hora_inicio) {
                    // Buscar por día y hora si no hay ID
                    const found = this.horariosDisponibles.find(hor => 
                        hor.dia === h.horario.dia && 
                        hor.hora_inicio === h.horario.hora_inicio &&
                        hor.hora_fin === h.horario.hora_fin
                    );
                    id = found ? found.id : null;
                } else if (h.dia && h.hora_inicio) {
                    // Buscar por día y hora directo
                    const found = this.horariosDisponibles.find(hor => 
                        hor.dia === h.dia && 
                        hor.hora_inicio === h.hora_inicio &&
                        hor.hora_fin === h.hora_fin
                    );
                    id = found ? found.id : null;
                }
                
                if (id && !horarioIds.includes(id)) {
                    horarioIds.push(id);
                }
            });
        }
        
        console.log('⏰ Horarios encontrados:', horarioIds);
        
        // Obtener IDs de contrato y nivel de inglés
        const tipoContratoId = this.contratos.find(c => c.nombre === this.docenteSeleccionado.tipo_contrato?.nombre)?.id || '';
        const nivelInglesId = this.nivelesIngles.find(n => n.nombre === this.docenteSeleccionado.nivel_ingles?.nombre)?.id || '';
        
        this.docenteEdicionVista = {
            primer_nombre: this.docenteSeleccionado.persona?.primer_nombre || '',
            segundo_nombre: this.docenteSeleccionado.persona?.segundo_nombre || '',
            primer_apellido: this.docenteSeleccionado.persona?.primer_apellido || '',
            segundo_apellido: this.docenteSeleccionado.persona?.segundo_apellido || '',
            cedula: this.docenteSeleccionado.persona?.cedula || '',
            correo: this.docenteSeleccionado.persona?.correo || '',
            telefono: this.docenteSeleccionado.persona?.telefono || '',
            tipo_contrato_id: tipoContratoId,
            experiencia_anios: this.docenteSeleccionado.experiencia_anios || 0,
            nivel_ingles_id: nivelInglesId,
            horas_disponibles: this.docenteSeleccionado.horas_disponibles || 0,
            max_horas_semanales: this.docenteSeleccionado.max_horas_semanales || 30,
            puede_dar_sabados: this.docenteSeleccionado.puede_dar_sabados || true,
            especializaciones: especIds,
            horarios: horarioIds,
            activo: this.docenteSeleccionado.activo || false
        };
        
        console.log('✅ Datos de edición preparados:', this.docenteEdicionVista);
    }

    agregarDocente() {
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
            puede_dar_sabados: this.nuevoDocente.puede_dar_sabados === true || this.nuevoDocente.puede_dar_sabados === 'true',
            especializaciones: this.nuevoDocente.especializaciones,
            horarios: this.nuevoDocente.horarios
        };

        this.http.post('http://localhost:3000/docentes', payload).subscribe({
            next: () => {
                this.mostrarInactivos = false;
                this.cerrarModal();
                this.cargarDocentes();
                setTimeout(() => {
                    this.filtrarDocentes();
                    this.paginaActual = 1;
                    this.aplicarPaginacion();
                }, 300);
            },
            error: (err) => {
                console.error('Error al agregar:', err);
                this.showToastMessage('No se pudo agregar el docente. Verifica los campos.', 'error');
            }
        });
    }

    toggleEspecializacion(id: string, event: Event) {
        const input = event.target as HTMLInputElement;
        const checked = input?.checked ?? false;
        const especs = this.nuevoDocente.especializaciones;

        if (checked) {
            if (!especs.includes(id)) especs.push(id);
        } else {
            const idx = especs.indexOf(id);
            if (idx > -1) especs.splice(idx, 1);
        }
    }

    toggleHorario(id: string, event: Event) {
        const input = event.target as HTMLInputElement;
        const checked = input?.checked ?? false;
        const horarios = this.nuevoDocente.horarios;

        if (checked) {
            if (!horarios.includes(id)) horarios.push(id);
        } else {
            const idx = horarios.indexOf(id);
            if (idx > -1) horarios.splice(idx, 1);
        }
    }

    // Métodos para la tabla de horarios mejorada
    toggleAllHorarios(event: Event) {
        const input = event.target as HTMLInputElement;
        const checked = input.checked;
        
        if (checked) {
            this.nuevoDocente.horarios = this.horariosDisponibles.map(h => h.id);
        } else {
            this.nuevoDocente.horarios = [];
        }
    }

    areAllHorariosSelected(): boolean {
        return this.horariosDisponibles.length > 0 && 
               this.nuevoDocente.horarios.length === this.horariosDisponibles.length;
    }

    areSomeHorariosSelected(): boolean {
        return this.nuevoDocente.horarios.length > 0 && 
               this.nuevoDocente.horarios.length < this.horariosDisponibles.length;
    }

    isHorarioSelected(horarioId: string): boolean {
        return this.nuevoDocente.horarios.includes(horarioId);
    }

    getSelectedHorariosCount(): number {
        return this.nuevoDocente.horarios.length;
    }

    formatTime(timeString: string): string {
        if (!timeString) return '';
        
        // Si ya está en formato HH:MM, devolverlo tal como está
        if (timeString.includes(':')) {
            const parts = timeString.split(':');
            return `${parts[0]}:${parts[1]}`;
        }
        
        // Si está en formato HH:MM:SS, extraer solo HH:MM
        if (timeString.includes(':')) {
            return timeString.substring(0, 5);
        }
        
        return timeString;
    }

    // Métodos para el modal de confirmación
    confirmarCargaDocentes() {
        if (this.docentesPendientes.length === 0) {
            this.showToastMessage('No hay docentes para cargar.', 'warning');
            return;
        }

        // Cargar cada docente a la base de datos
        let cargados = 0;
        let errores = 0;

        console.log('%c🚀 Iniciando carga de docentes:', 'color: blue; font-weight: bold;');
        console.log('%c📊 Total docentes a cargar:', 'color: blue; font-weight: bold;', this.docentesPendientes.length);
        console.log('%c📋 Primer docente a enviar:', 'color: blue; font-weight: bold;', this.docentesPendientes[0]);

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

    cancelarCargaDocentes() {
        this.mostrarModalConfirmacion = false;
        this.docentesPendientes = [];
    }

    private finalizarCarga(cargados: number, errores: number) {
        this.mostrarModalConfirmacion = false;
        this.docentesPendientes = [];
        
        if (errores === 0) {
            this.showToastMessage(`Se cargaron exitosamente ${cargados} docente(s).`, 'success');
        } else if (cargados === 0) {
            this.showToastMessage(`No se pudo cargar ningún docente. Revisa la consola para más detalles.`, 'error');
        } else {
            this.showToastMessage(`Se cargaron ${cargados} docente(s) y ${errores} fallaron. Revisa la consola para más detalles.`, 'warning');
        }
        
        // Recargar ambas listas para asegurar sincronización
        this.cargarDocentes();
        this.cargarDocentesInactivos();
    }

    // Métodos auxiliares para mostrar nombres en lugar de IDs
    getContratoNombre(contratoId: string): string {
        const contrato = this.contratos.find(c => c.id === contratoId);
        return contrato ? contrato.nombre : 'N/A';
    }

    getNivelInglesNombre(nivelId: string): string {
        const nivel = this.nivelesIngles.find(n => n.id === nivelId);
        return nivel ? nivel.nombre : 'N/A';
    }

    // Métodos de paginación
    aplicarPaginacion(): void {
        console.log('🔢 Aplicando paginación...');
        console.log('📊 Total docentes filtrados:', this.docentesFiltrados.length);
        console.log('📄 Docentes por página:', this.docentesPorPagina);
        
        this.totalPaginas = Math.ceil(this.docentesFiltrados.length / this.docentesPorPagina);
        console.log('📑 Total páginas:', this.totalPaginas);
        
        // Asegurar que la página actual sea válida
        if (this.paginaActual > this.totalPaginas) {
            this.paginaActual = this.totalPaginas > 0 ? this.totalPaginas : 1;
        }
        
        const inicio = (this.paginaActual - 1) * this.docentesPorPagina;
        const fin = inicio + this.docentesPorPagina;
        
        this.docentesPaginados = this.docentesFiltrados.slice(inicio, fin);
        console.log('✅ Docentes paginados:', this.docentesPaginados.length);
        console.log('📍 Página actual:', this.paginaActual);
    }

    aplicarPaginacionInactivos(): void {
        console.log('🔢 Aplicando paginación para inactivos...');
        console.log('📊 Total docentes inactivos filtrados:', this.docentesInactivosFiltrados.length);
        console.log('📄 Docentes por página:', this.docentesPorPagina);
        
        this.totalPaginas = Math.ceil(this.docentesInactivosFiltrados.length / this.docentesPorPagina);
        console.log('📑 Total páginas:', this.totalPaginas);
        
        // Asegurar que la página actual sea válida
        if (this.paginaActual > this.totalPaginas) {
            this.paginaActual = this.totalPaginas > 0 ? this.totalPaginas : 1;
        }
        
        const inicio = (this.paginaActual - 1) * this.docentesPorPagina;
        const fin = inicio + this.docentesPorPagina;
        
        this.docentesPaginados = this.docentesInactivosFiltrados.slice(inicio, fin);
        console.log('✅ Docentes inactivos paginados:', this.docentesPaginados.length);
        console.log('📍 Página actual:', this.paginaActual);
    }

    cambiarPagina(pagina: number): void {
        if (pagina >= 1 && pagina <= this.totalPaginas) {
            this.paginaActual = pagina;
            if (this.mostrarInactivos) {
                this.aplicarPaginacionInactivos();
            } else {
                this.aplicarPaginacion();
            }
        }
    }

    cambiarDocentesPorPagina(cantidad: number): void {
        this.docentesPorPagina = cantidad;
        this.paginaActual = 1; // Volver a la primera página
        if (this.mostrarInactivos) {
            this.aplicarPaginacionInactivos();
        } else {
            this.aplicarPaginacion();
        }
    }

    obtenerRangoPagina(): { inicio: number, fin: number, total: number } {
        const totalDocentes = this.mostrarInactivos ? this.docentesInactivosFiltrados.length : this.docentesFiltrados.length;
        const inicio = (this.paginaActual - 1) * this.docentesPorPagina + 1;
        const fin = Math.min(this.paginaActual * this.docentesPorPagina, totalDocentes);
        return {
            inicio: totalDocentes > 0 ? inicio : 0,
            fin: fin,
            total: totalDocentes
        };
    }

    obtenerPaginasVisibles(): number[] {
        const paginas: number[] = [];
        const maxPaginasVisibles = 5;
        
        if (this.totalPaginas <= maxPaginasVisibles) {
            // Mostrar todas las páginas si hay pocas
            for (let i = 1; i <= this.totalPaginas; i++) {
                paginas.push(i);
            }
        } else {
            // Mostrar páginas alrededor de la actual
            let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginasVisibles / 2));
            let fin = Math.min(this.totalPaginas, inicio + maxPaginasVisibles - 1);
            
            // Ajustar si estamos cerca del final
            if (fin - inicio + 1 < maxPaginasVisibles) {
                inicio = Math.max(1, fin - maxPaginasVisibles + 1);
            }
            
            for (let i = inicio; i <= fin; i++) {
                paginas.push(i);
            }
        }
        
        return paginas;
    }

    onItemsPorPaginaChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        if (target && target.value) {
            this.cambiarDocentesPorPagina(+target.value);
        }
    }



    validarExperiencia(event: Event): void {
        const input = event.target as HTMLInputElement;
        let valor = input.value.trim();
        
        // Si el campo está vacío, establecer en 0
        if (valor === '' || valor === null || valor === undefined) {
            this.filtroExperiencia = 0;
            input.value = '0';
            this.filtrarDocentes();
            return;
        }
        
        // Convertir a número
        let numero = parseFloat(valor);
        
        // Si no es un número válido o es negativo, establecer en 0
        if (isNaN(numero) || numero < 0) {
            numero = 0;
            this.filtroExperiencia = 0;
            input.value = '0';
            
            // Mostrar mensaje de advertencia
            console.warn('⚠️ La experiencia mínima no puede ser negativa. Se ha establecido en 0.');
        } else {
            // Si es un número válido y no negativo, actualizar el filtro
            this.filtroExperiencia = numero;
        }
        
        // Aplicar filtros después de la validación
        this.filtrarDocentes();
    }

    validarExperienciaModal(event: Event): void {
        const input = event.target as HTMLInputElement;
        let valor = input.value.trim();
        
        // Si el campo está vacío, establecer en 0
        if (valor === '' || valor === null || valor === undefined) {
            this.nuevoDocente.experiencia_anios = 0;
            input.value = '0';
            return;
        }
        
        // Convertir a número
        let numero = parseFloat(valor);
        
        // Si no es un número válido o es negativo, establecer en 0
        if (isNaN(numero) || numero < 0) {
            numero = 0;
            this.nuevoDocente.experiencia_anios = 0;
            input.value = '0';
            
            // Mostrar mensaje de advertencia
            console.warn('⚠️ La experiencia no puede ser negativa. Se ha establecido en 0.');
        } else {
            // Si es un número válido y no negativo, actualizar el valor
            this.nuevoDocente.experiencia_anios = numero;
        }
    }

    validarHorasModal(event: Event): void {
        const input = event.target as HTMLInputElement;
        let valor = input.value.trim();
        
        // Si el campo está vacío, establecer en 0
        if (valor === '' || valor === null || valor === undefined) {
            this.nuevoDocente.horas_disponibles = 0;
            input.value = '0';
            return;
        }
        
        // Convertir a número
        let numero = parseFloat(valor);
        
        // Si no es un número válido o es negativo, establecer en 0
        if (isNaN(numero) || numero < 0) {
            numero = 0;
            this.nuevoDocente.horas_disponibles = 0;
            input.value = '0';
            
            // Mostrar mensaje de advertencia
            console.warn('⚠️ Las horas disponibles no pueden ser negativas. Se ha establecido en 0.');
        } else {
            // Si es un número válido y no negativo, actualizar el valor
            this.nuevoDocente.horas_disponibles = numero;
        }
    }

    validarExperienciaEdicion(event: Event): void {
        const input = event.target as HTMLInputElement;
        let valor = input.value.trim();
        
        // Si el campo está vacío, establecer en 0
        if (valor === '' || valor === null || valor === undefined) {
            if (this.editIndex !== null) {
                this.docentesPaginados[this.editIndex].editValues.experiencia_anios = 0;
            }
            input.value = '0';
            return;
        }
        
        // Convertir a número
        let numero = parseFloat(valor);
        
        // Si no es un número válido o es negativo, establecer en 0
        if (isNaN(numero) || numero < 0) {
            numero = 0;
            if (this.editIndex !== null) {
                this.docentesPaginados[this.editIndex].editValues.experiencia_anios = 0;
            }
            input.value = '0';
            
            // Mostrar mensaje de advertencia
            console.warn('⚠️ La experiencia no puede ser negativa. Se ha establecido en 0.');
        } else {
            // Si es un número válido y no negativo, actualizar el valor
            if (this.editIndex !== null) {
                this.docentesPaginados[this.editIndex].editValues.experiencia_anios = numero;
            }
        }
    }

    validarHorasEdicion(event: Event): void {
        const input = event.target as HTMLInputElement;
        let valor = input.value.trim();
        
        // Si el campo está vacío, establecer en 0
        if (valor === '' || valor === null || valor === undefined) {
            if (this.editIndex !== null) {
                this.docentesPaginados[this.editIndex].editValues.horas_disponibles = 0;
            }
            input.value = '0';
            return;
        }
        
        // Convertir a número
        let numero = parseFloat(valor);
        
        // Si no es un número válido o es negativo, establecer en 0
        if (isNaN(numero) || numero < 0) {
            numero = 0;
            if (this.editIndex !== null) {
                this.docentesPaginados[this.editIndex].editValues.horas_disponibles = 0;
            }
            input.value = '0';
            
            // Mostrar mensaje de advertencia
            console.warn('⚠️ Las horas disponibles no pueden ser negativas. Se ha establecido en 0.');
        } else {
            // Si es un número válido y no negativo, actualizar el valor
            if (this.editIndex !== null) {
                this.docentesPaginados[this.editIndex].editValues.horas_disponibles = numero;
            }
        }
    }

    toggleEspecializacionEditar(docente: any, id: string, event: Event) {
        const input = event.target as HTMLInputElement;
        const checked = input.checked;
        if (!docente.editValues.especializaciones) {
            docente.editValues.especializaciones = [];
        }
        if (checked) {
            if (!docente.editValues.especializaciones.includes(id)) {
                docente.editValues.especializaciones.push(id);
            }
        } else {
            docente.editValues.especializaciones = docente.editValues.especializaciones.filter((eid: string) => eid !== id);
        }
    }

    eliminarFila(index: number) {
        const docente = this.docentesPaginados[index];
        if (!docente || !docente.id) {
            this.showToastMessage('Error: No se puede eliminar el docente. ID no encontrado.', 'error');
            return;
        }
        
        const confirmacion = confirm(`¿Estás seguro de eliminar al docente ${docente.persona?.primer_nombre} ${docente.persona?.primer_apellido}?`);
        if (!confirmacion) return;

        const payload = {
            docente_id: docente.id,
            activo: false
        };

        console.log('🗑️ Eliminando docente:', payload);

        this.http.patch('http://localhost:3000/docentes/estado', payload).subscribe({
            next: () => {
                console.log('✅ Docente eliminado correctamente');
                this.showToastMessage('Docente eliminado correctamente', 'success');
                // Recargar datos preservando la vista actual
                this.recargarDatosPreservandoVista();
            },
            error: (err) => {
                console.error('❌ Error al eliminar docente:', err);
                this.showToastMessage('No se pudo eliminar el docente. Verifica la conexión.', 'error');
            }
        });
    }

    reactivarDocente(index: number) {
        const docente = this.docentesPaginados[index];
        if (!docente || !docente.id) {
            this.showToastMessage('Error: No se puede reactivar el docente. ID no encontrado.', 'error');
            return;
        }
        
        const confirmacion = confirm(`¿Estás seguro de reactivar al docente ${docente.persona?.primer_nombre} ${docente.persona?.primer_apellido}?`);
        if (!confirmacion) return;

        const payload = {
            docente_id: docente.id,
            activo: true
        };

        console.log('🔄 Reactivando docente:', payload);

        this.http.patch('http://localhost:3000/docentes/estado', payload).subscribe({
            next: () => {
                console.log('✅ Docente reactivado correctamente');
                this.showToastMessage('Docente reactivado correctamente', 'success');
                // Recargar datos preservando la vista actual
                this.recargarDatosPreservandoVista();
            },
            error: (err) => {
                console.error('❌ Error al reactivar docente:', err);
                this.showToastMessage('No se pudo reactivar el docente. Verifica la conexión.', 'error');
            }
        });
    }

    resetearFiltros() {
        this.filtroContrato = 'Todos';
        this.filtroNivelIngles = 'Todos';
        this.filtroExperiencia = 0;
        this.textoBusqueda = '';
        
        if (this.mostrarInactivos) {
            this.docentesInactivosFiltrados = [...this.docentesInactivos];
            this.aplicarPaginacionInactivos();
        } else {
            this.docentesFiltrados = [...this.docentes];
            this.aplicarPaginacion();
        }
    }

    cambiarAVistaActivos() {
        this.mostrarInactivos = false;
        this.paginaActual = 1;
        this.resetearFiltros();
        console.log('🔄 Cambiando a vista de docentes activos');
    }

    cambiarAVistaInactivos() {
        this.mostrarInactivos = true;
        this.paginaActual = 1;
        this.cargarDocentesInactivos();
        console.log('🔄 Cambiando a vista de docentes inactivos');
    }

    cargarDesdeExcel(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) {
            console.warn('%c⚠️ No se seleccionó ningún archivo', 'color: orange; font-weight: bold;');
            return;
        }

        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e: any) => {
            const contenido = e.target.result as string;
            const lineas = limpiarLineasCSV(contenido);

            if (lineas.length <= 1) {
                console.warn('%c⚠️ El archivo no contiene datos válidos.', 'color: orange; font-weight: bold;');
                return;
            }

            const encabezados = extraerEncabezados(lineas);
            const filas = procesarFilas(lineas.slice(1), encabezados);

            console.log('%c📄 Datos crudos leídos del CSV:', 'color: #1976d2; font-weight: bold;', filas);

            const errores: string[] = [];

            const nuevosDocentes = filas.map(fila =>
                transformarAFilaDocente(
                    fila,
                    errores,
                    this.contratos,
                    this.nivelesIngles,
                    this.especializaciones,
                    this.horariosDisponibles
                )
            ).filter((d): d is any => !!d);

            console.log('%c📋 Docentes transformados:', 'color: green; font-weight: bold;', nuevosDocentes);

            if (errores.length > 0) {
                console.error('%c❌ Errores encontrados:', 'color: red; font-weight: bold;');
                errores.forEach(err => console.error(`→ ${err}`));
                alert('Se encontraron errores en el archivo. Revisa la consola para más detalles.');
                return;
            }

            if (nuevosDocentes.length === 0) {
                console.warn('%c⚠️ No se pudo cargar ningún docente (errores en todas las filas).', 'color: orange; font-weight: bold;');
                alert('No se pudo cargar ningún docente del archivo.');
                return;
            }

            // Mostrar modal de confirmación con los datos
            this.docentesPendientes = nuevosDocentes;
            this.mostrarModalConfirmacion = true;
            console.log('%c📋 Docentes pendientes de confirmación:', 'color: blue; font-weight: bold;', this.docentesPendientes);
        };

        reader.onerror = (e) => {
            console.error('%c💥 Error al leer el archivo:', 'color: red; font-weight: bold;', e);
        };

        reader.readAsText(file, 'utf-8');
        input.value = '';
    }



    editarFila(index: number) {
        this.editIndex = index;
        const docente = this.docentesPaginados[index];
        docente.backup = JSON.parse(JSON.stringify(docente));
        if (!docente.editValues) {
            const especIds = (docente.especializaciones || []).map((e: any) => {
                if (e.especializacion_id) return e.especializacion_id;
                if (e.especializacion?.id) return e.especializacion.id;
                if (e.especializacion?.nombre) {
                    const found = this.especializaciones.find(es => es.nombre === e.especializacion.nombre);
                    return found ? found.id : null;
                }
                return null;
            }).filter(Boolean);
            const tipoContratoId = this.contratos.find(c => c.nombre === docente.tipo_contrato?.nombre)?.id || '';
            const nivelInglesId = this.nivelesIngles.find(n => n.nombre === docente.nivel_ingles?.nombre)?.id || '';
            docente.editValues = {
                correo: docente.persona?.correo,
                telefono: docente.persona?.telefono,
                tipo_contrato_id: tipoContratoId,
                experiencia_anios: docente.experiencia_anios,
                nivel_ingles_id: nivelInglesId,
                                        horas_disponibles: docente.horas_disponibles,
                        max_horas_semanales: docente.max_horas_semanales || 30,
                        puede_dar_sabados: docente.puede_dar_sabados !== undefined ? docente.puede_dar_sabados : true,
                        especializaciones: especIds
            };
        }
    }

    cancelarEdicion() {
        if (this.editIndex !== null) {
            const backup = this.docentesPaginados[this.editIndex]?.backup;
            if (backup) {
                this.docentesPaginados[this.editIndex] = backup;
            }
        }
        this.editIndex = null;
    }

    guardarFila(index: number) {
        const docente = this.docentesPaginados[index];
        const original = docente.backup;
        if (!docente?.id || !docente?.persona?.id) {
            alert('Faltan IDs para actualizar.');
            return;
        }
        const edit = docente.editValues;
        const payload: any = {
            docente_id: docente.id,
            persona_id: docente.persona.id
        };
        // Solo enviar campos modificados
        if (edit.correo !== original.persona.correo) payload.correo = edit.correo;
        if (edit.telefono !== original.persona.telefono) payload.telefono = edit.telefono;
        if (edit.tipo_contrato_id !== (this.contratos.find(c => c.nombre === original.tipo_contrato?.nombre)?.id || '')) payload.tipo_contrato_id = edit.tipo_contrato_id;
        if (edit.experiencia_anios !== original.experiencia_anios) payload.experiencia_anios = edit.experiencia_anios;
        if (edit.nivel_ingles_id !== (this.nivelesIngles.find(n => n.nombre === original.nivel_ingles?.nombre)?.id || '')) payload.nivel_ingles_id = edit.nivel_ingles_id;
        if (edit.horas_disponibles !== original.horas_disponibles) payload.horas_disponibles = edit.horas_disponibles;
        if (edit.max_horas_semanales !== (original.max_horas_semanales || 30)) payload.max_horas_semanales = edit.max_horas_semanales;
        if (edit.puede_dar_sabados !== (original.puede_dar_sabados !== undefined ? original.puede_dar_sabados : true)) payload.puede_dar_sabados = edit.puede_dar_sabados === true || edit.puede_dar_sabados === 'true';
        // Especializaciones: comparar arrays de ids
        const origEspecIds = (original.especializaciones || []).map((e: any) => e.especializacion_id || e.especializacion?.id).filter(Boolean).sort();
        const newEspecIds = (edit.especializaciones || []).slice().sort();
        if (JSON.stringify(origEspecIds) !== JSON.stringify(newEspecIds)) payload.especializaciones = edit.especializaciones;

        if (Object.keys(payload).length <= 2) {
            alert('No hay cambios para guardar.');
            this.editIndex = null;
            return;
        }

        this.http.patch('http://localhost:3000/docentes', payload).subscribe({
            next: () => {
                alert('Docente actualizado correctamente.');
                this.editIndex = null;
                // Recargar datos preservando la vista actual
                this.recargarDatosPreservandoVista();
            },
            error: (err) => {
                console.error('Error al actualizar docente:', err);
                alert('No se pudo actualizar el docente.');
            }
        });
    }

    filtrarDocentes(): void {
        console.log('🔍 Filtrando docentes activos...');
        console.log('📋 Total docentes activos:', this.docentes.length);
        
        this.docentesFiltrados = this.docentes.filter(docente => {
            // Aplicar todos los filtros por contrato, nivel, experiencia y búsqueda
            return this.filtrarPorContrato(docente) &&
                this.filtrarPorNivel(docente) &&
                this.filtrarPorExperiencia(docente) &&
                this.filtrarPorBusqueda(docente);
        });
        
        console.log('✅ Docentes activos filtrados:', this.docentesFiltrados.length);
        
        // Aplicar paginación
        this.aplicarPaginacion();
    }

    filtrarDocentesInactivos(): void {
        console.log('🔍 Filtrando docentes inactivos...');
        console.log('📋 Total docentes inactivos:', this.docentesInactivos.length);
        
        this.docentesInactivosFiltrados = this.docentesInactivos.filter(docente => {
            // Aplicar todos los filtros por contrato, nivel, experiencia y búsqueda
            return this.filtrarPorContrato(docente) &&
                this.filtrarPorNivel(docente) &&
                this.filtrarPorExperiencia(docente) &&
                this.filtrarPorBusqueda(docente);
        });
        
        console.log('✅ Docentes inactivos filtrados:', this.docentesInactivosFiltrados.length);
        
        // Aplicar paginación para inactivos
        this.aplicarPaginacionInactivos();
    }

    // Método unificado para filtrar según la vista actual
    filtrarSegunVista(): void {
        if (this.mostrarInactivos) {
            this.filtrarDocentesInactivos();
        } else {
            this.filtrarDocentes();
        }
    }




    filtrarPorBusqueda(docente: any): boolean {
        const texto = this.textoBusqueda.trim().toLowerCase();
        const nombres = [
            docente.persona?.primer_nombre || '',
            docente.persona?.segundo_nombre || '',
            docente.persona?.primer_apellido || '',
            docente.persona?.segundo_apellido || ''
        ].join(' ').toLowerCase();
        return nombres.includes(texto);
    }
    filtrarPorContrato(docente: any): boolean {
        return this.filtroContrato === 'Todos' || docente.tipo_contrato?.nombre === this.filtroContrato;
    }

    filtrarPorNivel(docente: any): boolean {
        return this.filtroNivelIngles === 'Todos' || docente.nivel_ingles?.nombre === this.filtroNivelIngles;
    }

    filtrarPorExperiencia(docente: any): boolean {
        // Asegurar que el filtro de experiencia no sea negativo
        const experienciaMinima = Math.max(0, this.filtroExperiencia);
        
        // Si no hay filtro de experiencia (0), mostrar todos
        if (experienciaMinima === 0) {
            return true;
        }
        
        // Verificar que el docente tenga experiencia válida y mayor o igual al mínimo
        const experienciaDocente = docente.experiencia_anios || 0;
        return experienciaDocente >= experienciaMinima;
    }

    verDocente(index: number) {
        this.docenteSeleccionado = this.docentesPaginados[index];
        this.mostrarModalVista = true;
        this.modoEdicionVista = false;
        
        // Preparar datos para edición
        this.prepararDatosEdicion();
        
        console.log('👁️ Viendo docente:', this.docenteSeleccionado);
    }

    activarModoEdicion() {
        this.modoEdicionVista = true;
        console.log('✏️ Modo edición activado');
        console.log('📋 Datos de edición actuales:', this.docenteEdicionVista);
        console.log('📚 Especializaciones seleccionadas:', this.docenteEdicionVista?.especializaciones);
        console.log('⏰ Horarios seleccionados:', this.docenteEdicionVista?.horarios);
    }

    cancelarEdicionVista() {
        this.modoEdicionVista = false;
        this.prepararDatosEdicion(); // Restaurar datos originales
    }

    guardarEdicionVista() {
        if (!this.docenteSeleccionado || !this.docenteEdicionVista) {
            alert('Error: No hay datos para guardar.');
            return;
        }

        // Separar la actualización de datos del cambio de estado
        const datosPayload = {
            docente_id: this.docenteSeleccionado.id,
            persona_id: this.docenteSeleccionado.persona.id,
            primer_nombre: this.docenteEdicionVista.primer_nombre,
            segundo_nombre: this.docenteEdicionVista.segundo_nombre,
            primer_apellido: this.docenteEdicionVista.primer_apellido,
            segundo_apellido: this.docenteEdicionVista.segundo_apellido,
            cedula: this.docenteEdicionVista.cedula,
            correo: this.docenteEdicionVista.correo,
            telefono: this.docenteEdicionVista.telefono,
            tipo_contrato_id: this.docenteEdicionVista.tipo_contrato_id,
            experiencia_anios: this.docenteEdicionVista.experiencia_anios,
            nivel_ingles_id: this.docenteEdicionVista.nivel_ingles_id,
            horas_disponibles: this.docenteEdicionVista.horas_disponibles,
            max_horas_semanales: this.docenteEdicionVista.max_horas_semanales,
            puede_dar_sabados: this.docenteEdicionVista.puede_dar_sabados === true || this.docenteEdicionVista.puede_dar_sabados === 'true',
            especializaciones: this.docenteEdicionVista.especializaciones,
            horarios: this.docenteEdicionVista.horarios
        };

        // Verificar si el estado cambió
        const estadoCambio = this.docenteSeleccionado.activo !== this.docenteEdicionVista.activo;
        const estadoPayload = {
            docente_id: this.docenteSeleccionado.id,
            activo: this.docenteEdicionVista.activo
        };

        console.log('📝 Actualizando datos del docente:', datosPayload);
        if (estadoCambio) {
            console.log('🔄 Cambio de estado detectado:', estadoPayload);
        }

        // Primero actualizar los datos del docente
        this.http.patch('http://localhost:3000/docentes', datosPayload).subscribe({
            next: () => {
                console.log('✅ Datos del docente actualizados correctamente');
                
                // Si el estado cambió, actualizarlo por separado
                if (estadoCambio) {
                    this.http.patch('http://localhost:3000/docentes/estado', estadoPayload).subscribe({
                        next: () => {
                            console.log('✅ Estado del docente actualizado correctamente');
                            this.finalizarActualizacion();
                        },
                        error: (err) => {
                            console.error('❌ Error al actualizar estado:', err);
                            alert('⚠️ Los datos se actualizaron pero hubo un problema con el estado. Verifica la conexión.');
                            this.finalizarActualizacion();
                        }
                    });
                } else {
                    this.finalizarActualizacion();
                }
            },
            error: (err) => {
                console.error('❌ Error al actualizar datos del docente:', err);
                alert('❌ No se pudo actualizar el docente. Verifica los datos.');
            }
        });
    }

    private finalizarActualizacion() {
        alert('✅ Docente actualizado correctamente.');
        this.modoEdicionVista = false;
        
        console.log('🔄 Finalizando actualización - Vista actual:', this.mostrarInactivos ? 'Inactivos' : 'Activos');
        
        // Recargar datos preservando la vista actual
        this.recargarDatosPreservandoVista();
        
        this.cerrarModalVista();
    }

    // Método para recargar todos los datos
    recargarTodosLosDatos() {
        console.log('🔄 Recargando todos los datos...');
        this.cargarDocentes();
        this.cargarDocentesInactivos();
    }

    // Método para recargar todos los datos sin afectar la vista
    recargarTodosLosDatosSinCambiarVista() {
        console.log('🔄 Recargando todos los datos sin cambiar vista...');
        const wasShowingInactivos = this.mostrarInactivos;
        console.log('📋 Vista antes de recargar:', wasShowingInactivos ? 'Inactivos' : 'Activos');
        
        // Recargar datos de manera controlada
        this.recargarDatosConVistaPreservada(wasShowingInactivos);
    }

    // Método auxiliar para recargar datos preservando la vista
    private recargarDatosConVistaPreservada(wasShowingInactivos: boolean) {
        console.log('🔄 Iniciando recarga de datos con vista preservada...');
        console.log('📋 Vista a preservar:', wasShowingInactivos ? 'Inactivos' : 'Activos');
        
        // Recargar ambas listas
        this.http.get<any[]>('http://localhost:3000/docentes').subscribe(data => {
            console.log('📥 Docentes activos cargados:', data.length);
            this.procesarDocentesActivos(data);
            
            // Después de cargar activos, cargar inactivos
            this.http.get<any[]>('http://localhost:3000/docentes/inactivos').subscribe(dataInactivos => {
                console.log('📥 Docentes inactivos cargados:', dataInactivos.length);
                this.procesarDocentesInactivos(dataInactivos);
                
                // Restaurar la vista original
                this.mostrarInactivos = wasShowingInactivos;
                console.log('✅ Vista restaurada a:', wasShowingInactivos ? 'Inactivos' : 'Activos');
                
                // Aplicar filtros y paginación correspondiente
                if (wasShowingInactivos) {
                    console.log('🔍 Aplicando filtros para inactivos...');
                    this.filtrarDocentesInactivos();
                    console.log('📄 Aplicando paginación para inactivos...');
                    this.aplicarPaginacionInactivos();
                    console.log('📊 Docentes inactivos filtrados:', this.docentesInactivosFiltrados.length);
                    console.log('📊 Docentes inactivos paginados:', this.docentesPaginados.length);
                } else {
                    console.log('🔍 Aplicando filtros para activos...');
                    this.filtrarDocentes();
                    console.log('📄 Aplicando paginación para activos...');
                    this.aplicarPaginacion();
                    console.log('📊 Docentes activos filtrados:', this.docentesFiltrados.length);
                    console.log('📊 Docentes activos paginados:', this.docentesPaginados.length);
                }
                console.log('✅ Filtros y paginación aplicados para vista:', wasShowingInactivos ? 'Inactivos' : 'Activos');
            });
        });
    }

    // Método para recargar datos preservando la vista actual
    recargarDatosPreservandoVista() {
        console.log('🔄 Recargando datos preservando vista actual...');
        console.log('📋 Estado actual de mostrarInactivos:', this.mostrarInactivos);
        
        // Usar el método que recarga todo pero preserva la vista
        this.recargarTodosLosDatosSinCambiarVista();
        
        console.log('✅ Vista preservada:', this.mostrarInactivos ? 'Inactivos' : 'Activos');
    }

    // Métodos para manejar especializaciones y horarios en el modal de vista
    toggleEspecializacionVista(id: string, event: Event) {
        const input = event.target as HTMLInputElement;
        const checked = input?.checked ?? false;
        const especs = this.docenteEdicionVista.especializaciones;

        if (checked) {
            if (!especs.includes(id)) especs.push(id);
        } else {
            const idx = especs.indexOf(id);
            if (idx > -1) especs.splice(idx, 1);
        }
    }

    toggleHorarioVista(id: string, event: Event) {
        const input = event.target as HTMLInputElement;
        const checked = input?.checked ?? false;
        const horarios = this.docenteEdicionVista.horarios;

        if (checked) {
            if (!horarios.includes(id)) horarios.push(id);
        } else {
            const idx = horarios.indexOf(id);
            if (idx > -1) horarios.splice(idx, 1);
        }
    }

    toggleAllHorariosVista(event: Event) {
        const input = event.target as HTMLInputElement;
        const checked = input.checked;
        
        if (checked) {
            this.docenteEdicionVista.horarios = this.horariosDisponibles.map(h => h.id);
        } else {
            this.docenteEdicionVista.horarios = [];
        }
    }

    areAllHorariosSelectedVista(): boolean {
        return this.horariosDisponibles.length > 0 && 
               this.docenteEdicionVista.horarios.length === this.horariosDisponibles.length;
    }

    areSomeHorariosSelectedVista(): boolean {
        return this.docenteEdicionVista.horarios.length > 0 && 
               this.docenteEdicionVista.horarios.length < this.horariosDisponibles.length;
    }

    isHorarioSelectedVista(horarioId: string): boolean {
        const isSelected = this.docenteEdicionVista?.horarios?.includes(horarioId) || false;
        console.log(`🔍 Horario ${horarioId} seleccionado:`, isSelected);
        return isSelected;
    }

    getSelectedHorariosCountVista(): number {
        return this.docenteEdicionVista.horarios.length;
    }

    // Métodos de validación para el modal de vista
    validarExperienciaVista(event: Event): void {
        const input = event.target as HTMLInputElement;
        let valor = input.value.trim();
        
        if (valor === '' || valor === null || valor === undefined) {
            this.docenteEdicionVista.experiencia_anios = 0;
            input.value = '0';
            return;
        }
        
        let numero = parseFloat(valor);
        
        if (isNaN(numero) || numero < 0) {
            numero = 0;
            this.docenteEdicionVista.experiencia_anios = 0;
            input.value = '0';
            console.warn('⚠️ La experiencia no puede ser negativa. Se ha establecido en 0.');
        } else {
            this.docenteEdicionVista.experiencia_anios = numero;
        }
    }

    validarHorasVista(event: Event): void {
        const input = event.target as HTMLInputElement;
        let valor = input.value.trim();
        
        if (valor === '' || valor === null || valor === undefined) {
            this.docenteEdicionVista.horas_disponibles = 0;
            input.value = '0';
            return;
        }
        
        let numero = parseFloat(valor);
        
        if (isNaN(numero) || numero < 0) {
            numero = 0;
            this.docenteEdicionVista.horas_disponibles = 0;
            input.value = '0';
            console.warn('⚠️ Las horas disponibles no pueden ser negativas. Se ha establecido en 0.');
        } else {
            this.docenteEdicionVista.horas_disponibles = numero;
        }
    }

    showToastMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
        this.toastMessage = message;
        this.toastType = type;
        this.showToast = true;
        
        setTimeout(() => {
            this.showToast = false;
        }, 4000);
    }

}
