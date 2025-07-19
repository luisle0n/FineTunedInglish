export interface LoadingState {
  isLoading: boolean;
  loadingActions: string[];
}

export const initialState: LoadingState = {
  isLoading: false,
  loadingActions: []
}; 