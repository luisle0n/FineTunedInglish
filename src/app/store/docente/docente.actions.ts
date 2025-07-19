import { createAction, props } from '@ngrx/store';
import { Docente } from './docente.state';

// Load Docentes
export const loadDocentes = createAction('[Docente] Load Docentes');

export const loadDocentesSuccess = createAction(
  '[Docente] Load Docentes Success',
  props<{ docentes: Docente[] }>()
);

export const loadDocentesFailure = createAction(
  '[Docente] Load Docentes Failure',
  props<{ error: string }>()
);

// Load Single Docente
export const loadDocente = createAction(
  '[Docente] Load Docente',
  props<{ id: number }>()
);

export const loadDocenteSuccess = createAction(
  '[Docente] Load Docente Success',
  props<{ docente: Docente }>()
);

export const loadDocenteFailure = createAction(
  '[Docente] Load Docente Failure',
  props<{ error: string }>()
);

// Create Docente
export const createDocente = createAction(
  '[Docente] Create Docente',
  props<{ docente: Docente }>()
);

export const createDocenteSuccess = createAction(
  '[Docente] Create Docente Success',
  props<{ docente: Docente }>()
);

export const createDocenteFailure = createAction(
  '[Docente] Create Docente Failure',
  props<{ error: string }>()
);

// Update Docente
export const updateDocente = createAction(
  '[Docente] Update Docente',
  props<{ id: number; docente: Docente }>()
);

export const updateDocenteSuccess = createAction(
  '[Docente] Update Docente Success',
  props<{ docente: Docente }>()
);

export const updateDocenteFailure = createAction(
  '[Docente] Update Docente Failure',
  props<{ error: string }>()
);

// Delete Docente
export const deleteDocente = createAction(
  '[Docente] Delete Docente',
  props<{ id: number }>()
);

export const deleteDocenteSuccess = createAction(
  '[Docente] Delete Docente Success',
  props<{ id: number }>()
);

export const deleteDocenteFailure = createAction(
  '[Docente] Delete Docente Failure',
  props<{ error: string }>()
);

// Clear Error
export const clearDocenteError = createAction('[Docente] Clear Error'); 