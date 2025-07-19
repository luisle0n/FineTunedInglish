import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message: string;
  action?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({
    isLoading: false,
    message: 'Cargando...'
  });

  public loading$: Observable<LoadingState> = this.loadingSubject.asObservable();

  private activeLoadings = new Set<string>();

  show(message: string = 'Cargando...', action?: string): void {
    if (action) {
      this.activeLoadings.add(action);
    }
    
    this.loadingSubject.next({
      isLoading: true,
      message,
      action
    });
  }

  hide(action?: string): void {
    if (action) {
      this.activeLoadings.delete(action);
    }

    // Solo ocultar si no hay otros loadings activos
    if (this.activeLoadings.size === 0) {
      this.loadingSubject.next({
        isLoading: false,
        message: 'Cargando...'
      });
    }
  }

  hideAll(): void {
    this.activeLoadings.clear();
    this.loadingSubject.next({
      isLoading: false,
      message: 'Cargando...'
    });
  }

  isLoading(): boolean {
    return this.loadingSubject.value.isLoading;
  }

  getCurrentMessage(): string {
    return this.loadingSubject.value.message;
  }
} 