import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  standalone: true,
  selector: 'app-inicio-coordinador',
  templateUrl: './inicio-coordinador.component.html',
  styleUrls: ['./inicio-coordinador.component.scss'],
  imports: [CommonModule, HeaderComponent]
})

export class InicioCoordinadorComponent implements OnInit {
  // Variables para estadísticas del dashboard
  estadisticas: any = {
    docentes: {
      docentes_activos: 0,
      docentes_inactivos: 0,
      total_docentes: 0
    }
  };
  cargandoEstadisticas = true;

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  // === CARGA DE ESTADÍSTICAS ===
  cargarEstadisticas(): void {
    this.cargandoEstadisticas = true;
    console.log('📊 Cargando estadísticas del dashboard...');
    
    this.http.get<any>('http://localhost:3000/dashboard/estadisticas').subscribe({
      next: (response) => {
        console.log('📊 Respuesta completa de la API:', response);
        if (response.success && response.dashboard) {
          this.estadisticas = response.dashboard;
          console.log('✅ Estadísticas cargadas:', this.estadisticas);
          console.log('📈 Total docentes:', this.estadisticas.docentes.total_docentes);
        } else {
          console.error('❌ Respuesta inválida de la API');
        }
        this.cargandoEstadisticas = false;
      },
      error: (err) => {
        console.error('❌ Error cargando estadísticas:', err);
        this.cargandoEstadisticas = false;
      }
    });
  }


}
