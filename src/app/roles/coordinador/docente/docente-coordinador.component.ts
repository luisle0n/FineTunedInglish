import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-docente-coordinador',
  standalone: false,
  templateUrl: './docente-coordinador.component.html',
  styleUrls: ['./docente-coordinador.component.scss']
})
export class DocenteCoordinadorComponent implements OnInit {
  contratos: any[] = [];
  nivelesIngles: any[] = [];
  especializaciones: any[] = [];
  horariosDisponibles: any[] = [];

  docentes: any[] = [];
  docentesFiltrados: any[] = [];

  userMenuOpen: boolean = false;
  mostrarModal: boolean = false;
  textoBusqueda: string = '';
  filtroContrato: string = 'Todos';
  filtroNivelIngles: string = 'Todos';
  filtroExperiencia: number = 0;

  editIndex: number | null = null;

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarDocentes();
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  cerrarMenu() {
    this.userMenuOpen = false;
  }

  verPerfil() {
    console.log('Perfil del usuario');
  }

  cerrarSesion() {
    console.log('Cerrar sesión');
  }

  cargarCatalogos() {
    this.http.get<any[]>('http://localhost:3000/catalogos/tipos-contrato').subscribe(data => {
      this.contratos = data;
    });

    this.http.get<any[]>('http://localhost:3000/catalogos/niveles-ingles').subscribe(data => {
      this.nivelesIngles = data;
    });

    this.http.get<any[]>('http://localhost:3000/catalogos/especializaciones').subscribe(data => {
      this.especializaciones = data;
    });

    this.http.get<any[]>('http://localhost:3000/catalogos/horarios').subscribe(data => {
      this.horariosDisponibles = data;
    });
  }

  cargarDocentes() {
    this.http.get<any[]>('http://localhost:3000/docentes').subscribe(data => {
      this.docentes = data;
      this.docentesFiltrados = [...this.docentes];
    });
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
      especializaciones: [],
      horarios: []
    };
  }

  cerrarModal() {
    this.mostrarModal = false;
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
      especializaciones: this.nuevoDocente.especializaciones,
      horarios: this.nuevoDocente.horarios
    };

    this.http.post('http://localhost:3000/docentes', payload).subscribe({
      next: () => {
        this.cargarDocentes();
        this.cerrarModal();
      },
      error: (err) => {
        console.error('Error al agregar:', err);
        alert('No se pudo agregar el docente. Verifica los campos.');
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

  toggleEspecializacionEditar(docente: any, id: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;

    if (!docente.especializaciones) {
      docente.especializaciones = [];
    }

    if (checked) {
      if (!docente.especializaciones.some((e: any) => e.id === id)) {
        docente.especializaciones.push({ id });
      }
    } else {
      docente.especializaciones = docente.especializaciones.filter((e: any) => e.id !== id);
    }
  }

  eliminarFila(index: number) {
    const docente = this.docentesFiltrados[index];
    if (!docente || !docente.id) return;
    const confirmacion = confirm('¿Estás seguro de eliminar este docente?');
    if (!confirmacion) return;

    this.http.delete(`http://localhost:3000/docentes/${docente.id}`).subscribe({
      next: () => {
        this.cargarDocentes();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
      }
    });
  }

  resetearFiltros() {
    this.filtroContrato = 'Todos';
    this.filtroNivelIngles = 'Todos';
    this.filtroExperiencia = 0;
    this.textoBusqueda = '';
    this.docentesFiltrados = [...this.docentes];
  }

  cargarDesdeExcel(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('Archivo seleccionado:', file.name);
    } else {
      console.warn('No se seleccionó ningún archivo');
    }
  }

  editarFila(index: number) {
    this.editIndex = index;
    const original = this.docentesFiltrados[index];
    this.docentesFiltrados[index] = {
      ...original,
      backup: JSON.parse(JSON.stringify(original))
    };
  }

  cancelarEdicion() {
    if (this.editIndex !== null) {
      const backup = this.docentesFiltrados[this.editIndex]?.backup;
      if (backup) {
        this.docentesFiltrados[this.editIndex] = backup;
      }
    }
    this.editIndex = null;
  }

  guardarFila(index: number) {
    const docente = this.docentesFiltrados[index];
    if (!docente?.docente_id || !docente?.persona?.persona_id) {
      alert('Faltan IDs para actualizar.');
      return;
    }

    const payload = {
      docente_id: docente.docente_id,
      persona_id: docente.persona.persona_id,
      correo: docente.persona.correo,
      telefono: docente.persona.telefono,
      tipo_contrato_id: docente.tipo_contrato?.id,
      experiencia_anios: docente.experiencia_anios,
      nivel_ingles_id: docente.nivel_ingles?.id,
      horas_disponibles: docente.horas_disponibles,
      especializaciones: docente.especializaciones?.map((e: any) => e.id) ?? [],
      horarios: docente.horarios?.map((h: any) => h.id) ?? []
    };

    this.http.patch('http://localhost:3000/docentes', payload).subscribe({
      next: () => {
        alert('Docente actualizado correctamente.');
        this.editIndex = null;
        this.cargarDocentes();
      },
      error: (err) => {
        console.error('Error al actualizar docente:', err);
        alert('No se pudo actualizar el docente.');
      }
    });
  }
}
