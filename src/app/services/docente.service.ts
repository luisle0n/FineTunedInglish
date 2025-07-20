import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Docente {
  id: string;
  experiencia_anios: number;
  horas_disponibles: number;
  activo: boolean;
  persona: {
    id: string;
    cedula: string;
    correo: string;
    telefono: string;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
  };
  tipo_contrato: {
    nombre: string;
  };
  nivel_ingles: {
    nombre: string;
  };
  especializaciones: Array<{
    especializacion: {
      nombre: string;
    };
  }>;
  horarios: Array<{
    horario: {
      dia: string;
      hora_fin: string;
      hora_inicio: string;
    };
  }>;
}

export interface DocentePayload {
  docente_id: string;
  persona_id: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  cedula: string;
  correo: string;
  telefono: string;
  tipo_contrato_id: string;
  experiencia_anios: number;
  nivel_ingles_id: string;
  horas_disponibles: number;
  especializaciones: string[];
  horarios: string[];
}

export interface EstadoPayload {
  docente_id: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DocenteService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Obtener docentes activos
  getDocentesActivos(): Observable<Docente[]> {
    return this.http.get<Docente[]>(`${this.baseUrl}/docentes`);
  }

  // Obtener docentes inactivos
  getDocentesInactivos(): Observable<Docente[]> {
    return this.http.get<Docente[]>(`${this.baseUrl}/docentes/inactivos`);
  }

  // Crear nuevo docente
  crearDocente(payload: Omit<DocentePayload, 'docente_id' | 'persona_id'>): Observable<any> {
    return this.http.post(`${this.baseUrl}/docentes`, payload);
  }

  // Actualizar datos del docente
  actualizarDocente(payload: DocentePayload): Observable<any> {
    return this.http.patch(`${this.baseUrl}/docentes`, payload);
  }

  // Cambiar estado del docente
  cambiarEstado(payload: EstadoPayload): Observable<any> {
    return this.http.patch(`${this.baseUrl}/docentes/estado`, payload);
  }

  // Eliminar docente (cambiar a inactivo)
  eliminarDocente(docenteId: string): Observable<any> {
    return this.cambiarEstado({ docente_id: docenteId, activo: false });
  }

  // Reactivar docente
  reactivarDocente(docenteId: string): Observable<any> {
    return this.cambiarEstado({ docente_id: docenteId, activo: true });
  }

  // Cargar múltiples docentes desde Excel
  cargarDocentesMasivo(docentes: any[]): Observable<any>[] {
    return docentes.map(docente => this.crearDocente(docente));
  }
} 