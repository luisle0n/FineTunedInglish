import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
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

import { DocenteTalentoHumanoComponent } from './roles/talento-humano/docente/docente-talento-humano.component';
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
