import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" class="toast-notification" [ngClass]="type">
      <div class="toast-content">
        <span class="toast-icon">{{ getIcon() }}</span>
        <span class="toast-message">{{ message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-notification {
      position: fixed;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      min-width: 300px;
      max-width: 90vw;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 500;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 9999;
      text-align: center;
      transition: all 0.3s ease;
      opacity: 1;
      border: 2px solid transparent;
    }
    
    .toast-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .toast-icon {
      font-size: 1.2rem;
    }
    
    .toast-message {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .toast-notification.error {
      background-color: #fee;
      color: #c53030;
      border-color: #fed7d7;
    }
    
    .toast-notification.info {
      background-color: #ebf8ff;
      color: #2b6cb0;
      border-color: #bee3f8;
    }
    
    .toast-notification.success {
      background-color: #f0fff4;
      color: #22543d;
      border-color: #c6f6d5;
    }
    
    .toast-notification.warning {
      background-color: #fffbeb;
      color: #c05621;
      border-color: #faf089;
    }
  `]
})
export class ToastNotificationComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'info' | 'warning' = 'success';
  @Input() visible: boolean = false;

  getIcon(): string {
    switch (this.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      default: return '✅';
    }
  }
} 