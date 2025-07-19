import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface HorarioDocente {
  nombre: string;
  contrato: string;
  horario: {
    [dia: string]: string[];
  };
  totalHoras: number;
}

@Component({
  selector: 'app-generar-horarios',
    standalone: false,

  templateUrl: './horario-coordinador.component.html',
  styleUrls: ['./horario-coordinador.component.scss']
})
export class 
 HorarioCoordinadorComponent{
  archivoHorario: File | null = null;
  archivoEmpresarial: File | null = null;
  archivoAulas: File | null = null;

  configuracion = {
    priorizar: 'balanceado',
    distribuir: 'preferencias',
    fecha: '',
    periodo: '2024-1',
    respetarPeriodo: false,
    balancearTipoContrato: true
  };

  dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  horarioGenerado: HorarioDocente[] = [];
  userMenuOpen = false;

  constructor(private router: Router) {}

  generarHorario(): void {
    this.horarioGenerado = [
      {
        nombre: 'María López',
        contrato: 'Tiempo Completo',
        horario: {
          lunes: ['A101 (8:00–10:00)', 'A203 (10:00–12:00)', 'A105 (14:00–16:00)'],
          martes: ['A102 (10:00–12:00)', 'A304 (14:00–16:00)'],
          miercoles: ['A101 (8:00–10:00)', 'A203 (10:00–12:00)', 'A105 (14:00–16:00)'],
          jueves: ['A102 (10:00–12:00)', 'A304 (14:00–16:00)'],
          viernes: ['A205 (8:00–10:00)', 'A105 (10:00–12:00)']
        },
        totalHoras: 20
      },
      {
        nombre: 'Juan Pérez',
        contrato: 'Medio Tiempo',
        horario: {
          lunes: ['A201 (8:00–10:00)'],
          martes: ['A103 (8:00–10:00)', 'A201 (10:00–12:00)'],
          miercoles: ['A201 (8:00–10:00)'],
          jueves: ['A103 (8:00–10:00)'],
          viernes: ['A103 (14:00–16:00)']
        },
        totalHoras: 10
      },
      {
        nombre: 'Ana Rodríguez',
        contrato: 'Ocasional',
        horario: {
          lunes: [],
          martes: ['A202 (8:00–10:00)'],
          miercoles: ['A202 (10:00–12:00)'],
          jueves: ['A202 (8:00–10:00)'],
          viernes: ['A202 (10:00–12:00)']
        },
        totalHoras: 8
      },
      {
        nombre: 'Carlos Martínez',
        contrato: 'Tiempo Completo',
        horario: {
          lunes: ['A301 (8:00–10:00)', 'A302 (10:00–12:00)', 'A303 (14:00–16:00)'],
          martes: ['A301 (8:00–10:00)', 'A302 (10:00–12:00)', 'A303 (14:00–16:00)'],
          miercoles: ['A301 (8:00–10:00)', 'A302 (10:00–12:00)', 'A303 (14:00–16:00)'],
          jueves: ['A301 (8:00–10:00)', 'A302 (10:00–12:00)'],
          viernes: ['A301 (8:00–10:00)', 'A302 (10:00–12:00)']
        },
        totalHoras: 26
      },
      {
        nombre: 'Laura Sánchez',
        contrato: 'Tiempo Completo',
        horario: {
          lunes: ['A104 (8:00–10:00)', 'A204 (10:00–12:00)', 'A104 (14:00–16:00)'],
          martes: ['A104 (8:00–10:00)', 'A204 (10:00–12:00)'],
          miercoles: ['A104 (8:00–10:00)'],
          jueves: ['A104 (8:00–10:00)', 'A204 (10:00–12:00)'],
          viernes: ['A204 (10:00–12:00)']
        },
        totalHoras: 22
      }
    ];
  }

  /**
   * Devuelve una clase CSS según el total de horas:
   * - >= 24: rojo
   * - 16 a <24: amarillo
   * - < 16: verde
   */
  getColorPorCarga(horas: number): string {
    if (horas >= 24) return 'bg-red';
    if (horas >= 16) return 'bg-yellow';
    return 'bg-green';
  }

  subirArchivo(tipo: 'horario' | 'empresarial' | 'aulas', evento: Event): void {
    const input = evento.target as HTMLInputElement;
    if (input?.files?.length) {
      const archivo = input.files[0];
      if (tipo === 'horario') this.archivoHorario = archivo;
      if (tipo === 'empresarial') this.archivoEmpresarial = archivo;
      if (tipo === 'aulas') this.archivoAulas = archivo;
    }
  }

  // === MENÚ DE USUARIO ===
  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  cerrarMenu() {
    setTimeout(() => (this.userMenuOpen = false), 150);
  }

  verPerfil() {
    alert('Abrir vista de perfil');
    this.userMenuOpen = false;
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }
}
