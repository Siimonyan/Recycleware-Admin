import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./dashboard.scss'],
  template: `
    <!-- Toolbar -->
    <div class="dashboard-toolbar">
      <h2 id="pageTitle" class="dashboard-title">Panel General</h2>
      <button id="exportStatsBtn" class="btn-export" (click)="exportExcel()" title="Exportar estadísticas a Excel" aria-label="Exportar estadísticas a archivo CSV">
        <i class="bi bi-file-earmark-excel-fill text-success" aria-hidden="true"></i>
        Exportar Excel
      </button>
    </div>

    <!-- KPI Cards Row 1 -->
    <div class="kpi-grid" role="region" aria-label="Indicadores clave de rendimiento">

      <div id="kpi-users" class="kpi-card" (click)="nav('usuarios')" title="Ir a Usuarios" tabindex="0" role="link" (keyup.enter)="nav('usuarios')" aria-label="Usuarios totales: {{ stats.totalUsuarios ?? 'cargando' }}">
        <div class="kpi-icon users" aria-hidden="true">
          <i class="bi bi-people-fill"></i>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Usuarios</span>
          <span class="kpi-value">{{ stats.totalUsuarios ?? '—' }}</span>
        </div>
      </div>

      <div id="kpi-products" class="kpi-card" (click)="nav('productos')" title="Ir a Productos" tabindex="0" role="link" (keyup.enter)="nav('productos')" aria-label="Productos totales: {{ stats.totalProductos ?? 'cargando' }}">
        <div class="kpi-icon products" aria-hidden="true">
          <i class="bi bi-box-seam-fill"></i>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Productos</span>
          <span class="kpi-value">{{ stats.totalProductos ?? '—' }}</span>
        </div>
      </div>

      <div id="kpi-requests" class="kpi-card" (click)="nav('solicitudes')" title="Ir a Solicitudes" tabindex="0" role="link" (keyup.enter)="nav('solicitudes')" aria-label="Solicitudes totales: {{ stats.totalSolicitudes ?? 'cargando' }}">
        <div class="kpi-icon requests" aria-hidden="true">
          <i class="bi bi-file-earmark-text-fill"></i>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Solicitudes</span>
          <span class="kpi-value">{{ stats.totalSolicitudes ?? '—' }}</span>
        </div>
      </div>

      <div id="kpi-donations" class="kpi-card" (click)="nav('donaciones')" title="Ir a Donaciones" tabindex="0" role="link" (keyup.enter)="nav('donaciones')" aria-label="Donaciones totales: {{ stats.totalDonaciones ?? 'cargando' }}">
        <div class="kpi-icon donations" aria-hidden="true">
          <i class="bi bi-heart-fill"></i>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Donaciones</span>
          <span class="kpi-value">{{ stats.totalDonaciones ?? '—' }}</span>
        </div>
      </div>

    </div>

    <!-- Second Row: Status Breakdown + Quick Access -->
    <div class="dashboard-bottom mt-5">

      <!-- Solicitudes Breakdown -->
      <div class="breakdown-card" role="region" aria-labelledby="breakdownTitle">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 id="breakdownTitle">Estado de Solicitudes</h3>
          <button id="viewAllSolicitudesBtn" class="btn btn-link p-0 text-decoration-none" (click)="nav('solicitudes')" aria-label="Ver todas las solicitudes">Ver todas</button>
        </div>
        
        <div class="breakdown-list">
          <div class="breakdown-item" [attr.aria-label]="'Pendientes: ' + (stats.solicitudesPendientes ?? 0)">
            <div class="bd-label">
              <span class="status-dot pend" aria-hidden="true"></span> Pendiente
            </div>
            <div class="bd-bar-wrap">
              <div class="bd-bar bg-warning" [style.width.%]="getPct(stats.solicitudesPendientes, stats.totalSolicitudes)" role="progressbar" [attr.aria-valuenow]="getPct(stats.solicitudesPendientes, stats.totalSolicitudes)" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <span class="bd-count">{{ stats.solicitudesPendientes ?? 0 }}</span>
          </div>
          
          <div class="breakdown-item" [attr.aria-label]="'En revisión: ' + getEnRevision()">
            <div class="bd-label">
              <span class="status-dot rev" aria-hidden="true"></span> En Revisión
            </div>
            <div class="bd-bar-wrap">
              <div class="bd-bar bg-info" [style.width.%]="getPct(getEnRevision(), stats.totalSolicitudes)" role="progressbar" [attr.aria-valuenow]="getPct(getEnRevision(), stats.totalSolicitudes)" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <span class="bd-count">{{ getEnRevision() }}</span>
          </div>
          
          <div class="breakdown-item" [attr.aria-label]="'Aprobadas: ' + (stats.solicitudesAprobadas ?? 0)">
            <div class="bd-label">
              <span class="status-dot appr" aria-hidden="true"></span> Aprobada
            </div>
            <div class="bd-bar-wrap">
              <div class="bd-bar bg-success" [style.width.%]="getPct(stats.solicitudesAprobadas, stats.totalSolicitudes)" role="progressbar" [attr.aria-valuenow]="getPct(stats.solicitudesAprobadas, stats.totalSolicitudes)" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <span class="bd-count">{{ stats.solicitudesAprobadas ?? 0 }}</span>
          </div>
          
          <div class="breakdown-item" [attr.aria-label]="'Denegadas: ' + (stats.solicitudesDenegadas ?? 0)">
            <div class="bd-label">
              <span class="status-dot deny" aria-hidden="true"></span> Denegada
            </div>
            <div class="bd-bar-wrap">
              <div class="bd-bar bg-danger" [style.width.%]="getPct(stats.solicitudesDenegadas, stats.totalSolicitudes)" role="progressbar" [attr.aria-valuenow]="getPct(stats.solicitudesDenegadas, stats.totalSolicitudes)" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <span class="bd-count">{{ stats.solicitudesDenegadas ?? 0 }}</span>
          </div>
          
          <div class="breakdown-item" [attr.aria-label]="'Entregadas: ' + (stats.solicitudesEntregadas ?? 0)">
            <div class="bd-label">
              <span class="status-dot del" aria-hidden="true"></span> Entregada
            </div>
            <div class="bd-bar-wrap">
              <div class="bd-bar bg-primary" [style.width.%]="getPct(stats.solicitudesEntregadas, stats.totalSolicitudes)" role="progressbar" [attr.aria-valuenow]="getPct(stats.solicitudesEntregadas, stats.totalSolicitudes)" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <span class="bd-count">{{ stats.solicitudesEntregadas ?? 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Access Panel -->
      <div class="quick-access-card" role="region" aria-labelledby="quickAccessTitle">
        <h3 id="quickAccessTitle">Acceso Rápido</h3>
        <p class="text-muted mb-4">Navega directamente a cada sección del panel.</p>
        <div class="quick-grid">
          <button id="quickNavUsersBtn" class="quick-btn" (click)="nav('usuarios')" aria-label="Navegar a Usuarios">
            <i class="bi bi-people-fill" aria-hidden="true"></i>
            <span>Usuarios</span>
          </button>
          <button id="quickNavProdsBtn" class="quick-btn" (click)="nav('productos')" aria-label="Navegar a Productos">
            <i class="bi bi-box-seam-fill" aria-hidden="true"></i>
            <span>Productos</span>
          </button>
          <button id="quickNavCatsBtn" class="quick-btn" (click)="nav('categorias')" aria-label="Navegar a Categorías">
            <i class="bi bi-tags-fill" aria-hidden="true"></i>
            <span>Categorías</span>
          </button>
          <button id="quickNavSolsBtn" class="quick-btn" (click)="nav('solicitudes')" aria-label="Navegar a Solicitudes">
            <i class="bi bi-file-earmark-text-fill" aria-hidden="true"></i>
            <span>Solicitudes</span>
          </button>
          <button id="quickNavDonsBtn" class="quick-btn" (click)="nav('donaciones')" aria-label="Navegar a Donaciones">
            <i class="bi bi-heart-fill" aria-hidden="true"></i>
            <span>Donaciones</span>
          </button>
          <button id="quickNavMsgsBtn" class="quick-btn" (click)="nav('mensajes')" aria-label="Navegar a Mensajes">
            <i class="bi bi-envelope-fill" aria-hidden="true"></i>
            <span>Mensajes</span>
          </button>
          <button id="quickNavProfileBtn" class="quick-btn" (click)="nav('perfil')" aria-label="Navegar a Mi Perfil">
            <i class="bi bi-person-fill-gear" aria-hidden="true"></i>
            <span>Perfil</span>
          </button>
        </div>
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats: any = {};

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.apiService.getStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
      }
    });
  }

  nav(section: string) {
    this.router.navigate(['/admin/' + section]);
  }

  getPct(value: number | undefined, total: number | undefined): number {
    if (!value || !total || total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getEnRevision(): number {
    const total = this.stats.totalSolicitudes ?? 0;
    const pend = this.stats.solicitudesPendientes ?? 0;
    const appr = this.stats.solicitudesAprobadas ?? 0;
    const deny = this.stats.solicitudesDenegadas ?? 0;
    const entr = this.stats.solicitudesEntregadas ?? 0;
    return Math.max(0, total - pend - appr - deny - entr);
  }

  exportExcel() {
    const s = this.stats;
    const rows = [
      ['RECYCLEWARE - Exportación de Estadísticas', ''],
      ['Fecha', new Date().toLocaleDateString('es-ES')],
      ['', ''],
      ['USUARIOS', ''],
      ['Total Usuarios', s.totalUsuarios ?? 0],
      ['Particulares', s.totalParticulares ?? 0],
      ['Empresas', s.totalEmpresas ?? 0],
      ['', ''],
      ['PRODUCTOS', ''],
      ['Total Productos', s.totalProductos ?? 0],
      ['Disponibles', s.productosDisponibles ?? 0],
      ['Reservados', s.productosReservados ?? 0],
      ['', ''],
      ['SOLICITUDES', ''],
      ['Total Solicitudes', s.totalSolicitudes ?? 0],
      ['Pendientes', s.solicitudesPendientes ?? 0],
      ['En Revisión', this.getEnRevision()],
      ['Aprobadas', s.solicitudesAprobadas ?? 0],
      ['Denegadas', s.solicitudesDenegadas ?? 0],
      ['Entregadas', s.solicitudesEntregadas ?? 0],
      ['', ''],
      ['DONACIONES', ''],
      ['Total Donaciones', s.totalDonaciones ?? 0],
      ['Pendientes', s.donacionesPendientes ?? 0],
      ['Recibidas', s.donacionesRecibidas ?? 0],
    ];

    const csv = rows.map(r => r.map(c => `"${c}"`).join(';')).join('\n');
    const bom = '\uFEFF'; 
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recycleware_estadisticas_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
