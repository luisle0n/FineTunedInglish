import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';

import { DashboardCoordinadorComponent } from './roles/coordinador/dashboard-coordinador.component';
import { DocenteCoordinadorComponent } from './roles/coordinador/docente/docente-coordinador.component';
import { CriterioCoordinadorComponent } from './roles/coordinador/criterios/criterio-coordinador.component';
import { HorarioCoordinadorComponent } from './roles/coordinador/horarios/horario-coordinador.component';

import { DashboardTalentoHumanoComponent } from './roles/talento-humano/dashboard-talento-humano.component';
import { DocenteTalentoHumanoComponent } from './roles/talento-humano/docente/docente-talento-humano.component';
import { CriterioTalentoHumanoComponent } from './roles/talento-humano/criterios/criterios-telento-humano.component';

import { DashboardGerenciaComponent } from './roles/gerencia/dashboard-gerencia.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'coordinador',
    component: DashboardCoordinadorComponent,
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./roles/coordinador/inicio/inicio-coordinador.component')
            .then(m => m.InicioCoordinadorComponent)
      },
      { path: 'docente', component: DocenteCoordinadorComponent },
      { path: 'criterios', component: CriterioCoordinadorComponent },
      { path: 'horarios', component: HorarioCoordinadorComponent }
    ]
  },

  {
    path: 'talento-humano',
    component: DashboardTalentoHumanoComponent,
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./roles/talento-humano/inicio/inicio-talento-humano.component')
            .then(m => m.InicioTalentoHuemanoComponent)
      },
      { path: 'docente', component: DocenteTalentoHumanoComponent },
      { path: 'criterios', component: CriterioTalentoHumanoComponent } // ✅ Agregado
    ]
  },

  {
    path: 'gerencia',
    component: DashboardGerenciaComponent
    // Puedes agregar children aquí si Gerencia tiene vistas internas
  },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
