import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Persona {
  cedula: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  correo: string;
  telefono?: string;
}

export interface Docente {
  id: string;
  persona?: Persona;
  tipo_contrato?: {
    nombre: string;
  };
  experiencia_anios: number;
  nivel_ingles?: {
    nombre: string;
  };
  horas_disponibles?: number;
  horas_asignadas?: number;
  max_horas_semanales?: number;
  puede_dar_sabados?: boolean;
  especializaciones?: Array<{
    especializacion?: {
      id?: number;
      nombre?: string;
    };
  }>;
  activo: boolean;
  horarios?: Array<{
    dia: string;
    hora_inicio: string;
    hora_fin: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DocenteService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Obtener todos los docentes
  getDocentes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/docentes`);
  }

  // Obtener docentes activos
  getDocentesActivos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/docentes`);
  }

  // Obtener docentes inactivos
  getDocentesInactivos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/docentes/inactivos`);
  }

  // Obtener catálogos
  getTiposContrato(): Observable<any> {
    return this.http.get(`${this.baseUrl}/catalogos/tipos-contrato`);
  }

  getNivelesIngles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/catalogos/niveles-ingles`);
  }

  getEspecializaciones(): Observable<any> {
    return this.http.get(`${this.baseUrl}/catalogos/especializaciones`);
  }

  getHorarios(): Observable<any> {
    return this.http.get(`${this.baseUrl}/catalogos/horarios`);
  }

  // Crear docente
  crearDocente(docente: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/docentes`, docente);
  }

  // Actualizar docente
  actualizarDocente(id: string, docente: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/docentes/${id}`, docente);
  }

  // Eliminar docente
  eliminarDocente(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/docentes/${id}`);
  }

  // Reactivar docente
  reactivarDocente(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/docentes/${id}/restaurar`, {});
  }

  // Cargar docentes masivamente
  cargarDocentesMasivo(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/docentes/masivo`, data);
  }
} 