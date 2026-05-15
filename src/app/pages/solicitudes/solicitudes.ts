import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Solicitud } from '../../interfaces/admin.interfaces';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./solicitudes.scss'],
  template: `
    <div class="premium-card">
      <h3>Solicitudes de Productos</h3>
      <p class="text-muted mb-4">Gestiona las peticiones de los usuarios para adquirir productos reciclados.</p>

      <div class="table-responsive">
        <table class="premium-table" aria-label="Listado de solicitudes de productos">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Solicitante</th>
              <th scope="col">Producto</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let s of solicitudes">
              <tr *ngIf="s && s.id" class="animate-fade-in">
                <td><span class="text-muted">#{{ s.id }}</span></td>
                <td>
                  <div class="user-cell">
                    <p class="font-bold">{{ s.applicant?.nombre }}</p>
                    <p class="text-xs">{{ s.applicant?.correo }}</p>
                  </div>
                </td>
                <td>
                  <p class="font-bold">{{ s.product?.nombre }}</p>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(s.state?.name || '')">
                    {{ s.state?.name || 'Pendiente' }}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button [id]="'viewSolBtn-' + s.id" class="action-btn" (click)="viewInfo(s)" title="Ver Motivo" [attr.aria-label]="'Ver motivo de solicitud de ' + s.applicant?.nombre">
                      <i class="bi bi-info-circle-fill" aria-hidden="true"></i>
                    </button>
                    
                    <!-- Acción: En Revisión (ID 2) -->
                    <button [id]="'reviewSolBtn-' + s.id" class="action-btn btn-info" (click)="changeStatus(s.id, 2)" title="Poner En Revisión" [attr.aria-label]="'Poner en revisión solicitud de ' + s.applicant?.nombre">
                      <i class="bi bi-eye-fill" aria-hidden="true"></i>
                    </button>

                    <!-- Acción: Aprobar (ID 3) -->
                    <button [id]="'approveSolBtn-' + s.id" class="action-btn btn-approve" (click)="changeStatus(s.id, 3)" title="Aprobar" [attr.aria-label]="'Aprobar solicitud de ' + s.applicant?.nombre">
                      <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
                    </button>
                    
                    <!-- Acción: Rechazar (ID 4) -->
                    <button [id]="'rejectSolBtn-' + s.id" class="action-btn btn-reject" (click)="changeStatus(s.id, 4)" title="Rechazar" [attr.aria-label]="'Rechazar solicitud de ' + s.applicant?.nombre">
                      <i class="bi bi-x-circle-fill" aria-hidden="true"></i>
                    </button>

                    <!-- Acción: Entregar (ID 5) -->
                    <button [id]="'deliverSolBtn-' + s.id" class="action-btn btn-deliver" (click)="changeStatus(s.id, 5)" title="Marcar como Entregada" [attr.aria-label]="'Marcar como entregada solicitud de ' + s.applicant?.nombre">
                      <i class="bi bi-box-seam-fill" aria-hidden="true"></i>
                    </button>

                    <!-- Acción: Eliminar -->
                    <button [id]="'deleteSolBtn-' + s.id" class="action-btn delete" (click)="deleteSolicitud(s.id)" title="Eliminar Permanente" [attr.aria-label]="'Eliminar solicitud ' + s.id">
                      <i class="bi bi-trash-fill" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Información -->
    <div class="modal-overlay" *ngIf="showInfoModal" role="dialog" aria-labelledby="solModalTitle">
       <div class="modal-content animate-fade-in">
          <h3 id="solModalTitle">Detalles de la Solicitud</h3>
          
          <div class="info-section">
            <label id="applicantLabel">Solicitante</label>
            <p class="font-bold" aria-labelledby="applicantLabel">{{ selectedInfoItem?.applicant?.nombre }}</p>
            <p class="text-xs" aria-labelledby="applicantLabel">{{ selectedInfoItem?.applicant?.correo }}</p>
          </div>

          <div class="info-section">
            <label id="productLabel">Producto Solicitado</label>
            <p class="font-bold" aria-labelledby="productLabel">{{ selectedInfoItem?.product?.nombre }}</p>
          </div>

          <div class="info-section">
            <label id="reasonLabel">Motivo de la Petición</label>
            <div class="reason-box" role="textbox" aria-labelledby="reasonLabel" readonly>
              <p>{{ selectedInfoItem?.reason }}</p>
            </div>
          </div>
          
          <div class="modal-actions">
            <button id="closeSolModalBtn" class="btn-primary w-100" (click)="showInfoModal = false">Cerrar</button>
          </div>
       </div>
    </div>
  `
})
export class SolicitudesComponent implements OnInit {
  solicitudes: Solicitud[] = [];
  showInfoModal = false;
  selectedInfoItem: Solicitud | null = null;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadSolicitudes();
  }

  loadSolicitudes() {
    this.apiService.getSolicitudes().subscribe(res => {
      this.solicitudes = res;
      this.cdr.detectChanges();
    });
  }

  viewInfo(solicitud: Solicitud) {
    this.selectedInfoItem = solicitud;
    this.showInfoModal = true;
  }

  getStatusClass(status: string) {
    if (!status) return 'bg-warning';
    const s = status.toLowerCase();
    if (s.includes('pendiente')) return 'bg-warning';
    if (s.includes('aprobada') || s.includes('aceptada')) return 'bg-success';
    if (s.includes('revisión')) return 'bg-info';
    if (s.includes('denegada') || s.includes('rechazada')) return 'bg-danger';
    return 'bg-secondary';
  }

  changeStatus(id: number, idEstado: number) {
    let action = '';
    switch(idEstado) {
      case 2: action = 'poner en revisión'; break;
      case 3: action = 'aprobar'; break;
      case 4: action = 'rechazar'; break;
      case 5: action = 'marcar como entregada'; break;
      default: action = 'cambiar el estado de';
    }
    
    if (confirm(`¿Estás seguro de que deseas ${action} esta solicitud?`)) {
      this.apiService.updateSolicitudEstado(id, idEstado).subscribe(() => this.loadSolicitudes());
    }
  }

  deleteSolicitud(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar permanentemente esta solicitud?')) {
      this.apiService.deleteSolicitud(id).subscribe({
        next: () => this.loadSolicitudes(),
        error: (err) => {
          console.error('Error al eliminar solicitud:', err);
          alert('No se pudo eliminar la solicitud.');
        }
      });
    }
  }
}
