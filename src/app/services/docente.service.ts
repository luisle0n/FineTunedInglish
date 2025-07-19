import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Docente {
  id?: number;
  persona?: {
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    cedula: string;
    correo: string;
    telefono: string;
  };
  tipo_contrato_id?: number;
  experiencia_anios?: number;
  nivel_ingles_id?: number;
  horas_disponibles?: number;
  especializaciones?: number[];
  horarios?: number[];
}

export interface DocenteResponse {
  data: Docente[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocenteService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getDocentes(): Observable<Docente[]> {
    return this.http.get<Docente[]>(`${this.API_URL}/docentes`);
  }

  getDocenteById(id: number): Observable<Docente> {
    return this.http.get<Docente>(`${this.API_URL}/docentes/${id}`);
  }

  createDocente(docente: Docente): Observable<Docente> {
    return this.http.post<Docente>(`${this.API_URL}/docentes`, docente);
  }

  updateDocente(id: number, docente: Docente): Observable<Docente> {
    return this.http.put<Docente>(`${this.API_URL}/docentes/${id}`, docente);
  }

  deleteDocente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/docentes/${id}`);
  }

  uploadDocentes(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.API_URL}/docentes/upload`, formData);
  }

  searchDocentes(query: string): Observable<Docente[]> {
    return this.http.get<Docente[]>(`${this.API_URL}/docentes/search?q=${query}`);
  }
} 