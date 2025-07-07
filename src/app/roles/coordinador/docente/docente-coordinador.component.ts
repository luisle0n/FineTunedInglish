import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-docentes',
  standalone: false,
  templateUrl: './docente-coordinador.component.html',
  styleUrls: ['./docente-coordinador.component.scss']
})
export class DocenteCoordinadorComponent {
  userMenuOpen = false;
  editIndex: number | null = null;
  mostrarModal = false;

  // Filtros
  filtroContrato: string = 'Todos';
  filtroNivelIngles: string = 'Todos';
  filtroExperiencia: number = 0;
  textoBusqueda: string = '';

  // Lista completa
  listaDocentes = [
    {
      nombre: 'María López',
      tipoContrato: 'Tiempo Completo',
      experiencia: 5,
      nivelIngles: 'C1',
      horasDisponibles: 40,
      especializacion: 'General'
    },
    {
      nombre: 'Juan Pérez',
      tipoContrato: 'Medio Tiempo',
      experiencia: 3,
      nivelIngles: 'B2',
      horasDisponibles: 20,
      especializacion: 'Niños'
    }
  ];

  // Modelo para nuevo docente
  nuevoDocente = {
    nombre: '',
    tipoContrato: '',
    experiencia: 0,
    nivelIngles: '',
    horasDisponibles: 0,
    especializacion: ''
  };

  constructor(private router: Router) { }

  // === Menú usuario ===
  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  cerrarMenu() {
    setTimeout(() => this.userMenuOpen = false, 150);
  }

  verPerfil() {
    alert('Abrir vista de perfil');
    this.userMenuOpen = false;
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }

  // === Modal ===
  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevoDocente = {
      nombre: '',
      tipoContrato: '',
      experiencia: 0,
      nivelIngles: '',
      horasDisponibles: 0,
      especializacion: ''
    };
  }

  agregarDocente() {
    this.listaDocentes.push({ ...this.nuevoDocente });
    this.cerrarModal();
  }

  // === Edición ===
  editarFila(index: number): void {
    this.editIndex = index;
  }

  guardarFila(index: number): void {
    console.log('Docente actualizado:', this.listaDocentes[index]);
    this.editIndex = null;
  }

  cancelarEdicion(): void {
    this.editIndex = null;
  }

  eliminarFila(index: number): void {
    const confirmar = confirm('¿Estás seguro de eliminar este docente?');
    if (confirmar) {
      this.listaDocentes.splice(index, 1);
    }
  }

  // === Filtros ===
  get docentesFiltrados() {
    return this.listaDocentes.filter(docente => {
      const coincideContrato = this.filtroContrato === 'Todos' || docente.tipoContrato === this.filtroContrato;
      const coincideNivel = this.filtroNivelIngles === 'Todos' || docente.nivelIngles === this.filtroNivelIngles;
      const coincideExperiencia = docente.experiencia >= this.filtroExperiencia;
      const coincideBusqueda = docente.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase());

      return coincideContrato && coincideNivel && coincideExperiencia && coincideBusqueda;
    });
  }

  resetearFiltros() {
    this.filtroContrato = 'Todos';
    this.filtroNivelIngles = 'Todos';
    this.filtroExperiencia = 0;
    this.textoBusqueda = '';
  }

  // === Cargar Excel ===
  cargarDesdeExcel(event: any) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();

    lector.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const hoja = workbook.Sheets[workbook.SheetNames[0]];
      const registros = XLSX.utils.sheet_to_json(hoja);

      // Mapea y valida los datos
      registros.forEach((row: any) => {
        if (row.Nombre && row['Tipo de Contrato'] && row.Experiencia != null && row['Nivel de Inglés']) {
          this.listaDocentes.push({
            nombre: row.Nombre,
            tipoContrato: row['Tipo de Contrato'],
            experiencia: +row.Experiencia,
            nivelIngles: row['Nivel de Inglés'],
            horasDisponibles: +row['Horas Disponibles'] || 0,
            especializacion: row.Especialización || ''
          });
        }
      });

      alert('Docentes cargados exitosamente.');
    };

    lector.readAsArrayBuffer(archivo);
  }
}
