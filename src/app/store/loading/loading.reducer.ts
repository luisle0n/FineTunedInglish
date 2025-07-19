import { createReducer, on } from '@ngrx/store';
import { LoadingState, initialState } from './loading.state';
import * as LoadingActions from './loading.actions';

export const loadingReducer = createReducer(
  initialState,
  
  on(LoadingActions.showLoading, (state, { action }) => ({
    ...state,
    isLoading: true,
    loadingActions: [...state.loadingActions, action]
  })),
  
  on(LoadingActions.hideLoading, (state, { action }) => ({
    ...state,
    loadingActions: state.loadingActions.filter(a => a !== action),
    isLoading: state.loadingActions.filter(a => a !== action).length > 0
  })),
  
  on(LoadingActions.clearLoading, (state) => ({
    ...state,
    isLoading: false,
    loadingActions: []
  }))
); 