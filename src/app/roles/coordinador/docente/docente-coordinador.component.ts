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
            especializaciones: especIds
          },
          backup: null // para cancelar edición
        };
      });
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
    const docente = this.docentesFiltrados[index];
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
        especializaciones: especIds
      };
    }
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
        this.cargarDocentes();
      },
      error: (err) => {
        console.error('Error al actualizar docente:', err);
        alert('No se pudo actualizar el docente.');
      }
    });
  }
}
