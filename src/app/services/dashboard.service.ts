import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  docentes: {
    total_docentes: number;
    docentes_activos: number;
    docentes_inactivos: number;
    aulas_asignadas: number;
    horas_programadas: number;
    horas_disponibles: number;
    distribucion_tipo_contrato: Array<{
      tipo_contrato: string;
      total: number;
    }>;
    distribucion_nivel_ingles: Array<{
      nivel_ingles: string;
      total: number;
    }>;
  };
}

export interface DashboardResponse {
  success: boolean;
  dashboard: DashboardStats;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:3000/dashboard/estadisticas';

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.apiUrl);
  }
} 