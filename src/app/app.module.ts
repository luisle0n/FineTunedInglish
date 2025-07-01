import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardCoordinadorComponent } from './roles/coordinador/dashboard-coordinador.component';
import { DashboardGerenciaComponent } from './roles/gerencia/dashboard-gerencia.component';
import { DashboardTalentoHumanoComponent } from './roles/talento-humano/dashboard-talento-humano.component';
import { DocenteCoordinadorComponent } from './roles/coordinador/docente/docente-coordinador.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardCoordinadorComponent,
    DashboardGerenciaComponent,
    DashboardTalentoHumanoComponent,

  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
