import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Donacion } from '../../interfaces/admin.interfaces';

@Component({
  selector: 'app-donaciones',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./donaciones.scss'],
  template: `
    <div class="premium-card">
      <h3>Donaciones Entrantes</h3>
      <p class="text-muted mb-4">Revisa y valida las donaciones de productos realizadas por los usuarios.</p>

      <div class="table-responsive">
        <table class="premium-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Donante</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let d of donaciones">
              <tr *ngIf="d && d.id" class="animate-fade-in">
                <td><span class="text-muted">#{{ d.id }}</span></td>
                <td><span class="font-bold">{{ d.donante?.nombre || 'Donante Anónimo' }}</span></td>
                <td>{{ d.fechaDonacion | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(d.estado?.nombre || '')">
                    {{ d.estado?.nombre || 'Pendiente' }}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="action-btn info" (click)="viewInfo(d)" title="Ver Detalles">
                      <i class="bi bi-info-circle-fill"></i>
                    </button>
                    
                    <!-- Acción: Volver a Pendiente (ID 1) -->
                    <button (click)="changeStatus(d.id, 1)" class="action-btn state" title="Marcar como Pendiente">
                      <i class="bi bi-clock-history"></i>
                    </button>

                    <!-- Acción: En Recogida (ID 2) -->
                    <button (click)="changeStatus(d.id, 2)" class="action-btn info" title="Marcar En Recogida">
                      <i class="bi bi-truck"></i>
                    </button>

                    <!-- Acción: Recibido (Aprobar) (ID 3) -->
                    <button (click)="changeStatus(d.id, 3)" class="action-btn approve" title="Marcar como Recibida">
                      <i class="bi bi-check-circle-fill"></i>
                    </button>

                    <button (click)="deleteDonation(d.id)" class="action-btn delete" title="Eliminar">
                      <i class="bi bi-trash-fill"></i>
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
    <div class="modal-overlay" *ngIf="showInfoModal">
       <div class="modal-content animate-fade-in">
          <h3>Detalles de la Donación</h3>
          
          <div class="info-section">
            <label>Donante</label>
            <p class="font-bold">{{ selectedInfoItem?.donante?.nombre || 'Anónimo' }}</p>
          </div>

          <div class="info-section">
            <label>Fecha de Registro</label>
            <p class="font-bold">{{ selectedInfoItem?.fechaDonacion | date:'fullDate' }}</p>
          </div>

          <div class="info-section">
            <label>Descripción del Material</label>
            <div class="reason-box">
              <p>{{ selectedInfoItem?.descripcion }}</p>
            </div>
          </div>

          <div class="info-section" *ngIf="selectedInfoItem?.cantidadProductos">
            <label>Cantidad aproximada</label>
            <p class="font-bold">{{ selectedInfoItem?.cantidadProductos }} unidades</p>
          </div>
          
          <div class="modal-actions">
            <button class="btn-primary w-100" (click)="showInfoModal = false">Cerrar</button>
          </div>
       </div>
    </div>
  `
})
export class DonacionesComponent implements OnInit {
  donaciones: Donacion[] = [];
  showInfoModal = false;
  selectedInfoItem: Donacion | null = null;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadDonaciones();
  }

  loadDonaciones() {
    this.apiService.getDonaciones().subscribe(res => {
      this.donaciones = res;
      this.cdr.detectChanges();
    });
  }

  viewInfo(donacion: Donacion) {
    this.selectedInfoItem = donacion;
    this.showInfoModal = true;
  }

  getStatusClass(status: string) {
    const s = status.toLowerCase();
    if (s.includes('pendiente')) return 'bg-warning';
    if (s.includes('recibido') || s.includes('aprobado')) return 'bg-success';
    if (s.includes('recogida')) return 'bg-info';
    return 'bg-secondary';
  }

  changeStatus(id: number, idEstado: number) {
    this.apiService.updateDonacionEstado(id, idEstado).subscribe(() => this.loadDonaciones());
  }

  deleteDonation(id: number) {
    if (confirm('¿Eliminar registro de donación?')) {
      this.apiService.deleteDonacion(id).subscribe(() => this.loadDonaciones());
    }
  }
}
