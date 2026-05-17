import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./login.scss'],
  template: `
    <div class="login-page">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>

      <div class="login-wrapper animate-fade-in">
        <div class="login-container">
          
          <!-- Branding Section -->
          <div class="brand-section">
            <div class="brand-content">
              <img src="assets/img/logo.png" alt="RecycleWare Logo" class="brand-logo" onerror="this.src='https://img.icons8.com/fluency/96/recycle-sign.png';">
              <h1>Admin Dashboard</h1>
              <p>Gestiona eficientemente el ciclo de vida del reciclaje tecnológico.</p>
            </div>
          </div>

          <!-- Form Section -->
          <div class="form-section">
            <div class="form-content">
              <h2>Bienvenido</h2>
              <p class="subtitle">Ingresa tus credenciales de administrador</p>

              <form (ngSubmit)="onLogin()" #loginForm="ngForm">
                <div class="login-input-group">
                  <label for="adminEmail">Correo Electrónico</label>
                  <div class="input-wrapper">
                    <i class="bi bi-envelope"></i>
                    <input 
                      id="adminEmail"
                      type="email" 
                      name="email" 
                      [(ngModel)]="email" 
                      placeholder="admin@recycleware.com" 
                      required
                      [class.invalid]="error && !email">
                  </div>
                </div>

                <div class="login-input-group">
                  <label for="adminPassword">Contraseña</label>
                  <div class="input-wrapper">
                    <i class="bi bi-lock"></i>
                    <input 
                      id="adminPassword"
                      type="password" 
                      name="password" 
                      [(ngModel)]="password" 
                      placeholder="••••••••" 
                      required
                      [class.invalid]="error && !password">
                  </div>
                </div>

                <div *ngIf="error" class="error-alert animate-fade-in" role="alert" aria-live="assertive">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                  <span>{{ error }}</span>
                </div>

                <button id="loginSubmitBtn" type="submit" class="btn-login" [disabled]="loading || !loginForm.form.valid">
                  <span *ngIf="!loading">Iniciar Sesión</span>
                  <div *ngIf="loading" class="spinner-border spinner-border-sm text-light" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                </button>
              </form>
              
              <div class="help-links">
                <a href="#" (click)="preventNav($event)">¿Problemas para acceder? Contacta soporte</a>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  onLogin() {
    if (!this.email || !this.password) return;
    
    this.loading = true;
    this.error = '';
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.error = 'Credenciales incorrectas.';
        } else if (err.status === 403) {
          this.error = 'No tienes permisos de administrador.';
        } else {
          this.error = 'Error de conexión con el servidor.';
        }
        this.cdr.detectChanges();
      }
    });
  }
  
  preventNav(event: Event) {
    event.preventDefault();
  }
}
