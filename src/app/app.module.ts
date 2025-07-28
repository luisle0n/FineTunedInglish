import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';
// import { StoreModule } from '@ngrx/store';
// import { EffectsModule } from '@ngrx/effects';
// import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';

import { DashboardCoordinadorComponent } from './roles/coordinador/dashboard-coordinador.component';
import { DashboardGerenciaComponent } from './roles/gerencia/dashboard-gerencia.component';
import { DashboardTalentoHumanoComponent } from './roles/talento-humano/dashboard-talento-humano.component';

import { DocenteCoordinadorComponent } from './roles/coordinador/docente/docente-coordinador.component';
import { HorarioCoordinadorComponent } from './roles/coordinador/horarios/horario-coordinador.component';
import { AulasCoordinadorComponent } from './roles/coordinador/aulas/aulas-coordinador.component';
import { UsuarioCoordinadorComponent } from './roles/coordinador/usuarios/usuario.coordinador.component';
import { InicioCoordinadorComponent } from './roles/coordinador/inicio/inicio-coordinador.component';
import { ClasesCoordinadorComponent } from './roles/coordinador/clases/clases-coordinador.component';

import { DocenteTalentoHumanoComponent } from './roles/talento-humano/docente/docente-talento-humano.component';
import { HorarioTalentoHumanoComponent } from './roles/talento-humano/horarios/horario-talento-humano.component';
import { AulasTalentoHumanoComponent } from './roles/talento-humano/aulas/aulas-talento-humano.component';
import { InicioTalentoHuemanoComponent } from './roles/talento-humano/inicio/inicio-talento-humano.component';


import { DocenteGerenteComponent } from './roles/gerencia/docente/docente-gerente.component';
import { HorariosGerenteComponent } from './roles/gerencia/horarios/horarios-gerente.component';
import { AulasGerenteComponent } from './roles/gerencia/aulas/aulas-gerente.component';
import { ClasesGerenteComponent } from './roles/gerencia/clases/clases-gerente.component';
import { UsuarioGerenteComponent } from './roles/gerencia/usuario/usuario-gerente.component';
import { MensajesGerenteComponent } from './roles/gerencia/mensajes/mensajes-gerente.component';

import { ProfileComponent } from './shared/components/profile/profile.component';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

// Shared Components
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

// Store
import { reducers } from './store/app.state';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardCoordinadorComponent,
    DashboardGerenciaComponent,
    DashboardTalentoHumanoComponent,
    LoadingSpinnerComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule,
    DocenteCoordinadorComponent,
    DocenteTalentoHumanoComponent,
    HorarioCoordinadorComponent,
    AulasCoordinadorComponent,
    ProfileComponent,
    UsuarioCoordinadorComponent,
    InicioCoordinadorComponent,
    ClasesCoordinadorComponent,
    HorarioTalentoHumanoComponent,
    AulasTalentoHumanoComponent,
    InicioTalentoHuemanoComponent,

    DocenteGerenteComponent,
    HorariosGerenteComponent,
    AulasGerenteComponent,
    ClasesGerenteComponent,
    UsuarioGerenteComponent,
    MensajesGerenteComponent,
    // StoreModule.forRoot(reducers),
    // EffectsModule.forRoot([]),
    // StoreDevtoolsModule.instrument({
    //   maxAge: 25,
    //   logOnly: false
    // })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
