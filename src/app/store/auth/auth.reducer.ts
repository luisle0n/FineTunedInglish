import { createReducer, on } from '@ngrx/store';
import { AuthState, initialState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialState,
  
  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(AuthActions.loginSuccess, (state, { token, user }) => ({
    ...state,
    isAuthenticated: true,
    token,
    user,
    loading: false,
    error: null
  })),
  
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    token: null,
    user: null,
    loading: false,
    error
  })),
  
  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true
  })),
  
  on(AuthActions.logoutSuccess, (state) => ({
    ...state,
    isAuthenticated: false,
    token: null,
    user: null,
    loading: false,
    error: null
  })),
  
  // Check Auth
  on(AuthActions.checkAuth, (state) => ({
    ...state,
    loading: true
  })),
  
  on(AuthActions.checkAuthSuccess, (state, { token, user }) => ({
    ...state,
    isAuthenticated: true,
    token,
    user,
    loading: false
  })),
  
  on(AuthActions.checkAuthFailure, (state) => ({
    ...state,
    isAuthenticated: false,
    token: null,
    user: null,
    loading: false
  })),
  
  // Clear Error
  on(AuthActions.clearAuthError, (state) => ({
    ...state,
    error: null
  }))
); 