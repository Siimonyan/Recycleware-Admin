import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Mensaje } from '../../interfaces/admin.interfaces';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./mensajes.scss'],
  template: `
    <div class="premium-card">
      <div class="messages-header">
        <div>
          <h3>Bandeja de Contacto</h3>
          <p class="text-muted">Gestiona los mensajes enviados a través del formulario.</p>
        </div>
        <span class="badge-count" *ngIf="mensajes.length > 0" [attr.aria-label]="mensajes.length + ' mensajes totales'">{{ mensajes.length }} Mensajes</span>
      </div>

      <div class="messages-list" role="list">
        <div *ngFor="let m of mensajes; let i = index" class="message-item animate-fade-in" role="listitem">
          <div class="message-avatar" aria-hidden="true">
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
            
            <div class="message-actions mt-3" *ngIf="!m.leido">
                <button [id]="'respondMsgBtn-' + m.id" class="btn btn-sm btn-primary" (click)="openResponseModal(m)">Responder</button>
            </div>
            <div class="response-status mt-2" *ngIf="m.leido">
                <span class="badge bg-success">Respondido</span>
                <p class="text-xs text-muted mt-1" *ngIf="m.respuesta"><strong>Tú:</strong> {{ m.respuesta }}</p>
                <span class="text-xs text-muted" *ngIf="m.fechaRespuesta">Fecha: {{ m.fechaRespuesta | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
          </div>
        </div>
        
        <div *ngIf="mensajes.length === 0" class="empty-state" role="status">
          <i class="bi bi-envelope-open-fill" aria-hidden="true"></i>
          <p>No hay mensajes pendientes.</p>
        </div>
      </div>
    </div>

    <!-- Modal de Respuesta -->
    <div class="modal-overlay" *ngIf="showModal" role="dialog" aria-labelledby="modalTitle">
       <div class="modal-content animate-fade-in">
          <h3 id="modalTitle">Responder Mensaje</h3>
          <div class="sender-info mb-3">
            <p class="mb-0"><strong>Para:</strong> {{ currentMsg.nombre }}</p>
            <p class="text-muted small">{{ currentMsg.correo }}</p>
          </div>
          
          <div class="msg-original p-3 bg-light rounded mb-4">
            <p class="small text-muted mb-1">Mensaje original:</p>
            <p class="mb-0 italic">"{{ currentMsg.mensaje }}"</p>
          </div>

          <div class="form-group">
            <label for="responseTextarea">Tu respuesta</label>
            <textarea id="responseTextarea" class="form-control" [(ngModel)]="respuesta" rows="5" placeholder="Escribe aquí tu respuesta al usuario..."></textarea>
          </div>
          
          <div class="modal-actions mt-4">
            <button id="cancelMsgBtn" class="btn btn-light" (click)="closeModal()">Cancelar</button>
            <button id="sendMsgBtn" class="btn btn-primary" (click)="sendResponse()" [disabled]="!respuesta.trim() || sending">
                <i class="bi bi-send me-2" *ngIf="!sending"></i>
                {{ sending ? 'Enviando...' : 'Enviar Respuesta' }}
            </button>
          </div>
       </div>
    </div>
  `
})
export class MensajesComponent implements OnInit {
  mensajes: any[] = [];
  showModal = false;
  currentMsg: any = {};
  respuesta = '';
  sending = false;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadMensajes();
  }

  loadMensajes() {
    this.apiService.getMensajes().subscribe({
      next: (res) => {
        this.mensajes = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando mensajes:', err)
    });
  }

  openResponseModal(msg: any) {
    this.currentMsg = msg;
    this.respuesta = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentMsg = {};
    this.respuesta = '';
  }

  sendResponse() {
    if (!this.respuesta.trim()) return;
    this.sending = true;
    this.cdr.detectChanges();
    
    this.apiService.responderMensaje(this.currentMsg.id, this.respuesta).subscribe({
      next: () => {
        this.sending = false;
        this.loadMensajes();
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.sending = false;
        this.cdr.detectChanges();
        console.error('Error al enviar respuesta:', err);
        alert('Error al enviar la respuesta. Inténtalo de nuevo.');
      }
    });
  }

  getInitials(nombre: string): string {
    if (!nombre) return '?';
    return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
}
