import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsComponent } from './components/toasts.component';
import { NavbarComponent } from './components/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,ToastsComponent,NavbarComponent],
  template: `<app-navbar></app-navbar>
  <router-outlet></router-outlet>
  <app-toasts></app-toasts>

  `
})
export class App {}
