import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardCoordinadorComponent } from './roles/coordinador/dashboard-coordinador.component';
import { DashboardGerenciaComponent } from './roles/gerencia/dashboard-gerencia.component';
import { DashboardTalentoHumanoComponent } from './roles/talento-humano/dashboard-talento-humano.component';
import { DocenteCoordinadorComponent } from './roles/coordinador/docente/docente-coordinador.component';
import { CriterioCoordinadorComponent } from './roles/coordinador/criterios/criterio-coordinador.component';
import { HorarioCoordinadorComponent } from './roles/coordinador/horarios/horario-coordinador.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardCoordinadorComponent,
    DashboardGerenciaComponent,
    DashboardTalentoHumanoComponent,
    DocenteCoordinadorComponent,
    CriterioCoordinadorComponent,
    HorarioCoordinadorComponent
    // 🚫 NO INCLUIR InicioCoordinadorComponent aquí porque es standalone
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
