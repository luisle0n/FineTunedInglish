import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';

import { DashboardCoordinadorComponent } from './roles/coordinador/dashboard-coordinador.component';
import { DocenteCoordinadorComponent } from './roles/coordinador/docente/docente-coordinador.component';
import { HorarioCoordinadorComponent } from './roles/coordinador/horarios/horario-coordinador.component';
import { AulasCoordinadorComponent } from './roles/coordinador/aulas/aulas-coordinador.component';
import { ClasesCoordinadorComponent } from './roles/coordinador/clases/clases-coordinador.component';

import { DashboardTalentoHumanoComponent } from './roles/talento-humano/dashboard-talento-humano.component';
import { DocenteTalentoHumanoComponent } from './roles/talento-humano/docente/docente-talento-humano.component';
import { HorarioTalentoHumanoComponent } from './roles/talento-humano/horarios/horario-talento-humano.component';
import { AulasTalentoHumanoComponent } from './roles/talento-humano/aulas/aulas-talento-humano.component';

import { DashboardGerenciaComponent } from './roles/gerencia/dashboard-gerencia.component';
import { DocenteGerenteComponent } from './roles/gerencia/docente/docente-gerente.component';
import { HorariosGerenteComponent} from './roles/gerencia/horarios/horarios-gerente.component';
import { UsuarioGerenteComponent } from './roles/gerencia/usuario/usuario-gerente.component';
import { AulasGerenteComponent } from './roles/gerencia/aulas/aulas-gerente.component';
import { ClasesGerenteComponent } from './roles/gerencia/clases/clases-gerente.component';
import { MensajesGerenteComponent } from './roles/gerencia/mensajes/mensajes-gerente.component';
import { ProfileComponent } from './shared/components/profile/profile.component';
import { UsuarioCoordinadorComponent } from './roles/coordinador/usuarios/usuario.coordinador.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'coordinador',
    component: DashboardCoordinadorComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'coordinador academico' },
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./roles/coordinador/inicio/inicio-coordinador.component')
            .then(m => m.InicioCoordinadorComponent)
      },
      { path: 'docente', component: DocenteCoordinadorComponent },
      { path: 'horarios', component: HorarioCoordinadorComponent },
      { path: 'aulas', component: AulasCoordinadorComponent },
      { path: 'clases', component: ClasesCoordinadorComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'usuarios', component: UsuarioCoordinadorComponent }
    ]
  },

  {
    path: 'talento-humano',
    component: DashboardTalentoHumanoComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'talento humano' },
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./roles/talento-humano/inicio/inicio-talento-humano.component')
            .then(m => m.InicioTalentoHuemanoComponent)
      },
      { path: 'docente', component: DocenteTalentoHumanoComponent },
      { path: 'horarios', component: HorarioTalentoHumanoComponent },
      { path: 'aulas', component: AulasTalentoHumanoComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  },

  {
    path: 'gerente',
    component: DashboardGerenciaComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'gerente' },
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./roles/gerencia/inicio/inicio-gerente.component')
            .then(m => m.InicioGerenteComponent)
      },
      
      { path: 'docente', component: DocenteGerenteComponent},
      { path: 'horarios', component: HorariosGerenteComponent },
      { path: 'aulas', component: AulasGerenteComponent },
      { path: 'clases', component: ClasesGerenteComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'usuarios', component: UsuarioGerenteComponent },
      { path: 'mensajes', component: MensajesGerenteComponent }

    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
