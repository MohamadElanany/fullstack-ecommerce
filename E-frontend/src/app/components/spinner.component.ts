import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner" [ngClass]="size">
      <svg viewBox="0 0 50 50" class="svg">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
      <span *ngIf="label" class="label">{{ label }}</span>
    </div>
  `,
  styles: [`
    .spinner { display:inline-flex; align-items:center; gap:8px; }
    .svg { width:20px; height:20px; animation: rotate 1s linear infinite; }
    .path { stroke: currentColor; stroke-linecap: round; stroke-dasharray: 90; stroke-dashoffset: 0; animation: dash 1.2s ease-in-out infinite; color: inherit; }
    .small .svg { width:16px; height:16px; }
    .large .svg { width:28px; height:28px; }
    .label { font-size:13px; color:inherit; opacity:0.9 }
    @keyframes rotate { 100% { transform: rotate(360deg); } }
    @keyframes dash { 0% { stroke-dasharray: 1,200; stroke-dashoffset: 0; } 50% { stroke-dasharray: 90,150; stroke-dashoffset: -35; } 100% { stroke-dasharray: 90,150; stroke-dashoffset: -124; } }
  `]
})
export class SpinnerComponent {
  @Input() size: 'small'|'default'|'large' = 'default';
  @Input() label?: string;
}
