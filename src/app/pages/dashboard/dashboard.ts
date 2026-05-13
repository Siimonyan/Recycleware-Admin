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
      <h2 class="dashboard-title">Panel General</h2>
      <button class="btn-export" (click)="exportExcel()" title="Exportar estadísticas a Excel">
        <i class="bi bi-file-earmark-excel-fill text-success"></i>
        Exportar Excel
      </button>
    </div>

    <!-- KPI Cards Row 1 -->
    <div class="kpi-grid">

      <div class="kpi-card" (click)="nav('usuarios')" title="Ir a Usuarios">
        <div class="kpi-icon users">
          <i class="bi bi-people-fill"></i>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Usuarios</span>
          <span class="kpi-value">{{ stats.totalUsuarios ?? '—' }}</span>
        </div>
      </div>

      <div class="kpi-card" (click)="nav('productos')" title="Ir a Productos">
        <div class="kpi-icon products">
          <i class="bi bi-box-seam-fill"></i>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Productos</span>
          <span class="kpi-value">{{ stats.totalProductos ?? '—' }}</span>
        </div>
      </div>

      <div class="kpi-card" (click)="nav('solicitudes')" title="Ir a Solicitudes">
        <div class="kpi-icon requests">
          <i class="bi bi-file-earmark-text-fill"></i>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Solicitudes</span>
          <span class="kpi-value">{{ stats.totalSolicitudes ?? '—' }}</span>
        </div>
      </div>

      <div class="kpi-card" (click)="nav('donaciones')" title="Ir a Donaciones">
        <div class="kpi-icon donations">
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
      <div class="breakdown-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3>Estado de Solicitudes</h3>
          <button class="btn btn-link p-0 text-decoration-none" (click)="nav('solicitudes')">Ver todas</button>
        </div>
        
        <div class="breakdown-list">
          <div class="breakdown-item">
            <div class="bd-label">
              <span class="status-dot pend"></span> Pendiente
            </div>
            <div class="bd-bar-wrap">
              <div class="bd-bar bg-warning" [style.width.%]="getPct(stats.solicitudesPendientes, stats.totalSolicitudes)"></div>
            </div>
            <span class="bd-count">{{ stats.solicitudesPendientes ?? 0 }}</span>
          </div>
          
          <div class="breakdown-item">
            <div class="bd-label">
              <span class="status-dot rev"></span> En Revisión
            </div>
            <div class="bd-bar-wrap">
              <div class="bd-bar bg-info" [style.width.%]="getPct(getEnRevision(), stats.totalSolicitudes)"></div>
            </div>
            <span class="bd-count">{{ getEnRevision() }}</span>
          </div>
          
          <div class="breakdown-item">
            <div class="bd-label">
              <span class="status-dot appr"></span> Aprobada
            </div>
            <div class="bd-bar-wrap">
              <div class="bd-bar bg-success" [style.width.%]="getPct(stats.solicitudesAprobadas, stats.totalSolicitudes)"></div>
            </div>
            <span class="bd-count">{{ stats.solicitudesAprobadas ?? 0 }}</span>
          </div>
          
          <div class="breakdown-item">
            <div class="bd-label">
              <span class="status-dot deny"></span> Denegada
            </div>
            <div class="bd-bar-wrap">
              <div class="bd-bar bg-danger" [style.width.%]="getPct(stats.solicitudesDenegadas, stats.totalSolicitudes)"></div>
            </div>
            <span class="bd-count">{{ stats.solicitudesDenegadas ?? 0 }}</span>
          </div>
          
          <div class="breakdown-item">
            <div class="bd-label">
              <span class="status-dot del"></span> Entregada
            </div>
            <div class="bd-bar-wrap">
              <div class="bd-bar bg-primary" [style.width.%]="getPct(stats.solicitudesEntregadas, stats.totalSolicitudes)"></div>
            </div>
            <span class="bd-count">{{ stats.solicitudesEntregadas ?? 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Access Panel -->
      <div class="quick-access-card">
        <h3>Acceso Rápido</h3>
        <p class="text-muted mb-4">Navega directamente a cada sección del panel.</p>
        <div class="quick-grid">
          <button class="quick-btn" (click)="nav('usuarios')">
            <i class="bi bi-people-fill"></i>
            <span>Usuarios</span>
          </button>
          <button class="quick-btn" (click)="nav('productos')">
            <i class="bi bi-box-seam-fill"></i>
            <span>Productos</span>
          </button>
          <button class="quick-btn" (click)="nav('categorias')">
            <i class="bi bi-tags-fill"></i>
            <span>Categorías</span>
          </button>
          <button class="quick-btn" (click)="nav('solicitudes')">
            <i class="bi bi-file-earmark-text-fill"></i>
            <span>Solicitudes</span>
          </button>
          <button class="quick-btn" (click)="nav('donaciones')">
            <i class="bi bi-heart-fill"></i>
            <span>Donaciones</span>
          </button>
          <button class="quick-btn" (click)="nav('mensajes')">
            <i class="bi bi-envelope-fill"></i>
            <span>Mensajes</span>
          </button>
          <button class="quick-btn" (click)="nav('perfil')">
            <i class="bi bi-person-fill-gear"></i>
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
