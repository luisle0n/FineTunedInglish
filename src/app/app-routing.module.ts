import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardCoordinadorComponent } from './roles/coordinador/dashboard-coordinador.component';
import { DocenteCoordinadorComponent } from './roles/coordinador/docente/docente-coordinador.component';
import { CriterioCoordinadorComponent } from './roles/coordinador/criterios/criterio-coordinador.component';
import { HorarioCoordinadorComponent } from './roles/coordinador/horarios/horario-coordinador.component';

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
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
