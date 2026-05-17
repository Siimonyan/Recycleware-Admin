import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Donacion } from '../../interfaces/admin.interfaces';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-donaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./donaciones.scss'],
  template: `
    <div class="premium-card">
      <h3>Donaciones Entrantes</h3>
      <p class="text-muted mb-4">Revisa y valida las donaciones de productos realizadas por los usuarios.</p>

      <div class="table-header">
        <div class="search-box">
          <div class="input-group">
            <span class="input-group-text bg-transparent border-0"><i class="bi bi-search" aria-hidden="true"></i></span>
            <input id="donSearchInput" type="text" class="form-control" placeholder="Buscar por donante o descripción..." [(ngModel)]="filterTerm" aria-label="Buscar donaciones">
          </div>
        </div>
        <div class="filters">
          <label for="stateFilterSelect" class="visually-hidden">Filtrar por estado</label>
          <select id="stateFilterSelect" class="form-control" [(ngModel)]="selectedEstado">
            <option value="">Todos los Estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Recogida">En Recogida</option>
            <option value="Recibido">Recibido</option>
            <option value="Procesado">Procesado</option>
          </select>
        </div>
        <button id="refreshDonsBtn" class="btn btn-primary" (click)="loadDonaciones()" aria-label="Actualizar lista de donaciones">
          <i class="bi bi-arrow-clockwise me-2" aria-hidden="true"></i>
          Actualizar
        </button>
      </div>

      <div class="table-responsive">
        <table class="premium-table" aria-label="Listado de donaciones de productos">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Donante</th>
              <th scope="col">Fecha</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let d of filteredDonaciones()">
              <tr *ngIf="d && d.id" class="animate-fade-in">
                <td><span class="text-muted">#{{ d.id }}</span></td>
                <td>
                  <span class="font-bold">{{ d.donante?.nombre || 'Donante Anónimo' }}</span>
                  <span *ngIf="d.esAnonimo" class="badge bg-secondary ms-2" style="font-size: 0.7em;">Privado</span>
                </td>
                <td>{{ d.fechaDonacion | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(d.estado?.nombre || '')">
                    {{ d.estado?.nombre || 'Pendiente' }}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button [id]="'viewDonBtn-' + d.id" class="action-btn info" (click)="viewInfo(d)" title="Ver Detalles" [attr.aria-label]="'Ver detalles de donación de ' + (d.donante?.nombre || 'anónimo')">
                      <i class="bi bi-info-circle-fill" aria-hidden="true"></i>
                    </button>
                    
                    <!-- Acción: Volver a Pendiente (ID 1) -->
                    <button [id]="'pendingDonBtn-' + d.id" (click)="changeStatus(d.id, 1)" class="action-btn state" title="Marcar como Pendiente" [attr.aria-label]="'Marcar como pendiente donación de ' + (d.donante?.nombre || 'anónimo')">
                      <i class="bi bi-clock-history" aria-hidden="true"></i>
                    </button>

                    <!-- Acción: En Recogida (ID 2) -->
                    <button [id]="'collectDonBtn-' + d.id" (click)="changeStatus(d.id, 2)" class="action-btn info" title="Marcar En Recogida" [attr.aria-label]="'Marcar en recogida donación de ' + (d.donante?.nombre || 'anónimo')">
                      <i class="bi bi-truck" aria-hidden="true"></i>
                    </button>

                    <!-- Acción: Recibido (Aprobar) (ID 3) -->
                    <button [id]="'receiveDonBtn-' + d.id" (click)="changeStatus(d.id, 3)" class="action-btn approve" title="Marcar como Recibida" [attr.aria-label]="'Marcar como recibida donación de ' + (d.donante?.nombre || 'anónimo')">
                      <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
                    </button>

                    <button [id]="'deleteDonBtn-' + d.id" (click)="deleteDonation(d.id)" class="action-btn delete" title="Eliminar" [attr.aria-label]="'Eliminar registro de donación de ' + (d.donante?.nombre || 'anónimo')">
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
    <div class="modal-overlay" *ngIf="showInfoModal" role="dialog" aria-labelledby="donModalTitle">
       <div class="modal-content animate-fade-in">
          <h3 id="donModalTitle">Detalles de la Donación</h3>
          
          <div class="info-section">
            <label id="donanteLabel">Donante</label>
            <p class="font-bold" aria-labelledby="donanteLabel">{{ selectedInfoItem?.donante?.nombre || 'Anónimo' }}</p>
          </div>

          <div class="info-section">
            <label id="fechaLabel">Fecha de Registro</label>
            <p class="font-bold" aria-labelledby="fechaLabel">{{ selectedInfoItem?.fechaDonacion | date:'fullDate' }}</p>
          </div>

          <div class="info-section">
            <label id="descLabel">Descripción del Material</label>
            <div class="reason-box" role="textbox" aria-labelledby="descLabel" readonly>
              <p>{{ selectedInfoItem?.descripcion }}</p>
            </div>
          </div>

          <div class="info-section" *ngIf="selectedInfoItem?.cantidadProductos">
            <label id="qtyLabel">Cantidad aproximada</label>
            <p class="font-bold" aria-labelledby="qtyLabel">{{ selectedInfoItem?.cantidadProductos }} unidades</p>
          </div>
          
          <div class="modal-actions">
            <button id="closeDonModalBtn" class="btn-primary w-100" (click)="showInfoModal = false">Cerrar</button>
          </div>
       </div>
    </div>
  `
})
export class DonacionesComponent implements OnInit {
  donaciones: Donacion[] = [];
  showInfoModal = false;
  selectedInfoItem: Donacion | null = null;
  filterTerm = '';
  selectedEstado = '';

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  filteredDonaciones() {
    return this.donaciones.filter(d => {
      // 1. Filtrar por término de búsqueda (nombre del donante o descripción de la donación)
      const donanteNombre = d.donante?.nombre || 'Donante Anónimo';
      const matchesSearch = !this.filterTerm || 
        (donanteNombre.toLowerCase().includes(this.filterTerm.toLowerCase())) ||
        (d.descripcion?.toLowerCase().includes(this.filterTerm.toLowerCase()));

      // 2. Filtrar por estado
      const matchesEstado = !this.selectedEstado || 
        (d.estado?.nombre?.toLowerCase() === this.selectedEstado.toLowerCase());

      return matchesSearch && matchesEstado;
    });
  }

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
