import { createAction, props } from '@ngrx/store';

// Login
export const login = createAction(
  '[Auth] Login',
  props<{ username: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ token: string; user: any }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Logout
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

// Check Auth
export const checkAuth = createAction('[Auth] Check Auth');

export const checkAuthSuccess = createAction(
  '[Auth] Check Auth Success',
  props<{ token: string; user: any }>()
);

export const checkAuthFailure = createAction('[Auth] Check Auth Failure');

// Clear Error
export const clearAuthError = createAction('[Auth] Clear Error'); 