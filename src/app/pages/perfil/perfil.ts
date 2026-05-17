import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../interfaces/admin.interfaces';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./perfil.scss'],
  template: `
    <div class="premium-card animate-fade-in">
      <h3>Mi Perfil de Administrador</h3>
      <p class="text-muted mb-4">Gestiona tu información personal y credenciales de acceso.</p>

      <form (ngSubmit)="saveProfile()" *ngIf="user">
        <div class="form-grid">
          <div class="form-group">
            <label for="profileName">Nombre Completo</label>
            <input id="profileName" type="text" class="form-control" [(ngModel)]="user.nombre" name="nombre">
          </div>
          <div class="form-group">
            <label for="profileEmail">Correo Electrónico</label>
            <input id="profileEmail" type="email" class="form-control" [(ngModel)]="user.correo" name="correo">
          </div>
          <div class="form-group">
            <label for="profilePhone">Teléfono</label>
            <input id="profilePhone" type="text" class="form-control" [(ngModel)]="user.telefono" name="telefono">
          </div>
          <div class="form-group">
            <label for="profileDni">DNI</label>  
            <input id="profileDni" type="text" class="form-control" [(ngModel)]="user.dni" name="dni" readonly aria-describedby="dniHelp">
            <small id="dniHelp" class="text-muted d-block mt-1">El DNI no se puede modificar.</small>
          </div>
          <div class="form-group">
            <label for="profileAddress">Dirección</label>
            <input id="profileAddress" type="text" class="form-control" [(ngModel)]="user.direccion" name="direccion">
          </div>
          <div class="form-group">
            <label for="profileLoc">Localidad</label>
            <input id="profileLoc" type="text" class="form-control" [(ngModel)]="user.localidad" name="localidad">
          </div>
          <div class="form-group">
            <label for="profileCp">Código Postal</label>
            <input id="profileCp" type="text" class="form-control" [(ngModel)]="user.codigoPostal" name="cp">
          </div>
        </div>

        <div class="footer-actions">
          <button id="saveProfileBtn" type="submit" class="btn btn-primary" [disabled]="saving">
            <i class="bi bi-save me-2" aria-hidden="true"></i>
            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>

      <div *ngIf="successMsg" class="success-alert animate-fade-in" role="alert" aria-live="polite">
        <i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
        {{ successMsg }}
      </div>
    </div>
  `
})
export class PerfilComponent implements OnInit {
  user: Usuario | null = null;
  saving = false;
  successMsg = '';

  constructor(private authService: AuthService, private apiService: ApiService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = { ...currentUser };
    }
  }

  saveProfile() {
    if (!this.user) return;
    this.saving = true;
    this.successMsg = '';

    this.apiService.updateProfile(this.user).pipe(
      timeout(6000)
    ).subscribe({
      next: (updated) => {
        this.saving = false;
        this.successMsg = '¡Perfil actualizado correctamente!';
        this.authService.updateCurrentUser(updated);
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMsg = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.saving = false;
        console.error('Error al actualizar perfil:', err);
        alert('Hubo un problema al actualizar tus datos.');
      }
    });
  }
}
