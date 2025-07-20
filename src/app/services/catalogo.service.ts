import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Catalogo {
  id: string;
  nombre: string;
}

export interface Horario extends Catalogo {
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Obtener tipos de contrato
  getTiposContrato(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(`${this.baseUrl}/tipos-contrato`);
  }

  // Obtener niveles de inglés
  getNivelesIngles(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(`${this.baseUrl}/niveles-ingles`);
  }

  // Obtener especializaciones
  getEspecializaciones(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(`${this.baseUrl}/especializaciones`);
  }

  // Obtener horarios disponibles
  getHorariosDisponibles(): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${this.baseUrl}/horarios`);
  }

  // Cargar todos los catálogos
  cargarTodosLosCatalogos(): Observable<{
    contratos: Catalogo[];
    nivelesIngles: Catalogo[];
    especializaciones: Catalogo[];
    horarios: Horario[];
  }> {
    return new Observable(observer => {
      let contratos: Catalogo[] = [];
      let nivelesIngles: Catalogo[] = [];
      let especializaciones: Catalogo[] = [];
      let horarios: Horario[] = [];
      let completados = 0;

      const verificarCompletado = () => {
        completados++;
        if (completados === 4) {
          observer.next({
            contratos,
            nivelesIngles,
            especializaciones,
            horarios
          });
          observer.complete();
        }
      };

      this.getTiposContrato().subscribe({
        next: (data) => {
          contratos = data;
          verificarCompletado();
        },
        error: (err) => {
          console.error('Error al cargar tipos de contrato:', err);
          verificarCompletado();
        }
      });

      this.getNivelesIngles().subscribe({
        next: (data) => {
          nivelesIngles = data;
          verificarCompletado();
        },
        error: (err) => {
          console.error('Error al cargar niveles de inglés:', err);
          verificarCompletado();
        }
      });

      this.getEspecializaciones().subscribe({
        next: (data) => {
          especializaciones = data;
          verificarCompletado();
        },
        error: (err) => {
          console.error('Error al cargar especializaciones:', err);
          verificarCompletado();
        }
      });

      this.getHorariosDisponibles().subscribe({
        next: (data) => {
          horarios = data;
          verificarCompletado();
        },
        error: (err) => {
          console.error('Error al cargar horarios:', err);
          verificarCompletado();
        }
      });
    });
  }
} 