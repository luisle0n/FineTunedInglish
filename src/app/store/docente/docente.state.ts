import { createFeatureSelector, createSelector } from '@ngrx/store';

export interface Docente {
  id?: number;
  persona?: {
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    cedula: string;
    correo: string;
    telefono: string;
  };
  tipo_contrato_id?: number;
  experiencia_anios?: number;
  nivel_ingles_id?: number;
  horas_disponibles?: number;
  especializaciones?: number[];
  horarios?: number[];
}

export interface DocenteState {
  docentes: Docente[];
  selectedDocente: Docente | null;
  loading: boolean;
  error: string | null;
}

export const initialState: DocenteState = {
  docentes: [],
  selectedDocente: null,
  loading: false,
  error: null
};

// Selectors
export const selectDocenteState = createFeatureSelector<DocenteState>('docente');

export const selectAllDocentes = createSelector(
  selectDocenteState,
  (state) => state.docentes
);

export const selectSelectedDocente = createSelector(
  selectDocenteState,
  (state) => state.selectedDocente
);

export const selectDocenteLoading = createSelector(
  selectDocenteState,
  (state) => state.loading
);

export const selectDocenteError = createSelector(
  selectDocenteState,
  (state) => state.error
); 