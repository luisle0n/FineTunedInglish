import { createAction, props } from '@ngrx/store';

export const showLoading = createAction(
  '[Loading] Show Loading',
  props<{ action: string }>()
);

export const hideLoading = createAction(
  '[Loading] Hide Loading',
  props<{ action: string }>()
);

export const clearLoading = createAction('[Loading] Clear Loading'); 