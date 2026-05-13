import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Mensaje } from '../../interfaces/admin.interfaces';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./mensajes.scss'],
  template: `
    <div class="premium-card">
      <div class="messages-header">
        <div>
          <h3>Bandeja de Contacto</h3>
          <p class="text-muted">Gestiona los mensajes enviados a través del formulario.</p>
        </div>
        <span class="badge-count" *ngIf="mensajes.length > 0">{{ mensajes.length }} Mensajes</span>
      </div>

      <div class="messages-list">
        <div *ngFor="let m of mensajes" class="message-item animate-fade-in">
          <div class="message-avatar">
            {{ getInitials(m.nombre) }}
          </div>
          <div class="message-content">
            <div class="message-top">
              <div>
                <span class="sender-name">{{ m.nombre }}</span>
                <span class="sender-email">{{ m.correo }}</span>
              </div>
              <span class="message-date">{{ m.fechaEnvio | date:'dd MMM, HH:mm' }}</span>
            </div>
            <p class="message-text">{{ m.mensaje }}</p>
          </div>
        </div>
        
        <div *ngIf="mensajes.length === 0" class="empty-state">
          <i class="bi bi-envelope-open-fill"></i>
          <p>No hay mensajes pendientes.</p>
        </div>
      </div>
    </div>
  `
})
export class MensajesComponent implements OnInit {
  mensajes: any[] = [];

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.apiService.getMensajes().subscribe({
      next: (res) => {
        this.mensajes = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando mensajes:', err)
    });
  }

  getInitials(nombre: string): string {
    if (!nombre) return '?';
    return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
}
