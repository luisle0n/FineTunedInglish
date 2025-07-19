import { createReducer, on } from '@ngrx/store';
import { DocenteState, initialState } from './docente.state';
import * as DocenteActions from './docente.actions';

export const docenteReducer = createReducer(
  initialState,
  
  // Load Docentes
  on(DocenteActions.loadDocentes, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(DocenteActions.loadDocentesSuccess, (state, { docentes }) => ({
    ...state,
    docentes,
    loading: false,
    error: null
  })),
  
  on(DocenteActions.loadDocentesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Load Single Docente
  on(DocenteActions.loadDocente, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(DocenteActions.loadDocenteSuccess, (state, { docente }) => ({
    ...state,
    selectedDocente: docente,
    loading: false,
    error: null
  })),
  
  on(DocenteActions.loadDocenteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Create Docente
  on(DocenteActions.createDocente, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(DocenteActions.createDocenteSuccess, (state, { docente }) => ({
    ...state,
    docentes: [...state.docentes, docente],
    loading: false,
    error: null
  })),
  
  on(DocenteActions.createDocenteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Update Docente
  on(DocenteActions.updateDocente, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(DocenteActions.updateDocenteSuccess, (state, { docente }) => ({
    ...state,
    docentes: state.docentes.map(d => d.id === docente.id ? docente : d),
    selectedDocente: docente,
    loading: false,
    error: null
  })),
  
  on(DocenteActions.updateDocenteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Delete Docente
  on(DocenteActions.deleteDocente, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(DocenteActions.deleteDocenteSuccess, (state, { id }) => ({
    ...state,
    docentes: state.docentes.filter(d => d.id !== id),
    selectedDocente: state.selectedDocente?.id === id ? null : state.selectedDocente,
    loading: false,
    error: null
  })),
  
  on(DocenteActions.deleteDocenteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Clear Error
  on(DocenteActions.clearDocenteError, (state) => ({
    ...state,
    error: null
  }))
); 