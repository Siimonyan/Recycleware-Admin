import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../interfaces/admin.interfaces';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./usuarios.scss'],
  template: `
    <div class="premium-card">
      <div class="table-header">
        <div class="search-box">
          <div class="input-group">
            <span class="input-group-text bg-transparent border-0"><i class="bi bi-search" aria-hidden="true"></i></span>
            <input id="userSearchInput" type="text" class="form-control" placeholder="Buscar por nombre o correo..." [(ngModel)]="filterTerm" aria-label="Buscar usuarios">
          </div>
        </div>
        <button id="refreshUsersBtn" class="btn btn-primary" (click)="loadUsuarios()" aria-label="Actualizar lista de usuarios">
          <i class="bi bi-arrow-clockwise me-2" aria-hidden="true"></i>
          Actualizar
        </button>
      </div>

      <div class="table-responsive">
        <table class="premium-table" aria-label="Listado de usuarios registrados">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre</th>
              <th scope="col">Correo</th>
              <th scope="col">Rol</th>
              <th scope="col">Localidad</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of filteredUsuarios()" class="animate-fade-in">
              <td><span class="text-muted">#{{ u.id }}</span></td>
              <td>
                <span class="font-bold" [class.text-muted]="u.activo === false">
                  {{ u.nombre }}
                  <span *ngIf="u.activo === false" class="badge bg-danger ms-2" style="font-size: 0.7em;">Inactivo</span>
                </span>
              </td>
              <td>{{ u.correo }}</td>
              <td>
                <span class="badge" [ngClass]="u.rol.toLowerCase()">{{ u.rol }}</span>
              </td>
              <td>{{ u.localidad || '—' }}</td>
              <td>
                <div class="table-actions">
                  <button [id]="'editUserBtn-' + u.id" (click)="editUsuario(u)" class="action-btn edit" title="Editar Datos" [attr.aria-label]="'Editar datos de ' + u.nombre">
                    <i class="bi bi-pencil-fill" aria-hidden="true"></i>
                  </button>
                  <button [id]="'roleUserBtn-' + u.id" (click)="openRoleModal(u)" class="action-btn role" title="Cambiar Rol" [attr.aria-label]="'Cambiar rol de ' + u.nombre">
                    <i class="bi bi-shield-lock-fill" aria-hidden="true"></i>
                  </button>
                   <button *ngIf="u.id !== currentAdminId" [id]="'deleteUserBtn-' + u.id" (click)="deleteUsuario(u)" class="action-btn" [ngClass]="u.activo !== false ? 'delete' : 'approve'" [title]="u.activo !== false ? 'Desactivar' : 'Reactivar'" [attr.aria-label]="(u.activo !== false ? 'Desactivar usuario ' : 'Reactivar usuario ') + u.nombre">
                      <i class="bi" [ngClass]="u.activo !== false ? 'bi-trash-fill' : 'bi-arrow-counterclockwise'" aria-hidden="true"></i>
                   </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Editar Usuario -->
    <div class="modal-overlay" *ngIf="showEditModal" role="dialog" aria-labelledby="editUserTitle">
       <div class="modal-content animate-fade-in">
          <h3 id="editUserTitle">Editar Usuario</h3>
          <p class="text-muted mb-4">Modifica los datos del usuario.</p>
          
          <div class="form-group">
            <label for="editUserName">Nombre Completo</label>
            <input id="editUserName" type="text" class="form-control" [(ngModel)]="currentUser.nombre">
          </div>
          
          <div class="form-group">
            <label for="editUserEmail">Correo Electrónico</label>
            <input id="editUserEmail" type="email" class="form-control" [(ngModel)]="currentUser.correo">
          </div>
          
          <div class="form-group">
            <label for="editUserLoc">Localidad</label>
            <input id="editUserLoc" type="text" class="form-control" [(ngModel)]="currentUser.localidad">
          </div>
          
          <div class="modal-actions">
            <button id="cancelEditUserBtn" class="btn btn-light" (click)="closeEditModal()">Cancelar</button>
            <button id="saveEditUserBtn" class="btn-primary" (click)="saveUsuario()">Guardar Cambios</button>
          </div>
       </div>
    </div>

    <!-- Modal Cambiar Rol -->
    <div class="modal-overlay" *ngIf="showRoleModal" role="dialog" aria-labelledby="changeRoleTitle">
       <div class="modal-content animate-fade-in">
          <h3 id="changeRoleTitle">Cambiar Rol</h3>
          <p class="text-muted mb-4">Selecciona el nuevo rol para <strong>{{ roleUser.nombre }}</strong>.</p>
          
          <div class="form-group">
            <label for="roleSelect">Nuevo Rol</label>
            <select id="roleSelect" class="form-control" [(ngModel)]="roleUser.rol">
              <option *ngFor="let rol of availableRoles" [value]="rol">{{ rol }}</option>
            </select>
          </div>
          
          <div class="modal-actions">
            <button id="cancelRoleBtn" class="btn btn-light" (click)="closeRoleModal()">Cancelar</button>
            <button id="saveRoleBtn" class="btn-primary" (click)="saveRole()">Asignar Rol</button>
          </div>
       </div>
    </div>
  `
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  filterTerm = '';
  showEditModal = false;
  currentUser: any = {};
  currentAdminId: number | null = null;
  
  showRoleModal = false;
  roleUser: any = {};
  availableRoles = ['ADMIN', 'PARTICULAR', 'EMPRESA'];

  constructor(private apiService: ApiService, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.currentAdminId = this.authService.getCurrentUser()?.id || null;
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.apiService.getUsuarios().subscribe(res => {
      this.usuarios = res;
      this.cdr.detectChanges();
    });
  }

  filteredUsuarios() {
    return this.usuarios.filter(u => 
      u.nombre.toLowerCase().includes(this.filterTerm.toLowerCase()) ||
      u.correo.toLowerCase().includes(this.filterTerm.toLowerCase())
    );
  }

  editUsuario(usuario: Usuario) {
    this.currentUser = { ...usuario };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.currentUser = {};
  }

  saveUsuario() {
    if (this.currentUser.id) {
      this.apiService.updateUsuario(this.currentUser.id, this.currentUser).subscribe({
        next: () => {
          this.loadUsuarios();
          this.closeEditModal();
        },
        error: (err) => {
          console.error('Error al actualizar el usuario', err);
          alert('Hubo un error al guardar los cambios.');
        }
      });
    }
  }

  openRoleModal(usuario: Usuario) {
    this.roleUser = { ...usuario };
    this.showRoleModal = true;
  }

  closeRoleModal() {
    this.showRoleModal = false;
    this.roleUser = {};
  }

  saveRole() {
    if (this.roleUser.id && this.roleUser.rol) {
      this.apiService.updateRol(this.roleUser.id, this.roleUser.rol).subscribe({
        next: () => {
          this.loadUsuarios();
          this.closeRoleModal();
        },
        error: (err) => {
          console.error('Error al actualizar rol', err);
          const msg = err.error?.error || 'Hubo un error al cambiar el rol.';
          alert(msg);
        }
      });
    }
  }

  deleteUsuario(u: Usuario) {
    const isActivo = u.activo !== false;
    const actionText = isActivo ? 'desactivar' : 'reactivar';
    if (confirm(`¿Estás seguro de que deseas ${actionText} a este usuario?`)) {
      this.apiService.deleteUsuario(u.id).subscribe({
        next: () => {
          this.loadUsuarios();
        },
        error: (err) => {
          console.error(`Error al ${actionText} usuario:`, err);
          const msg = err.error?.error || `No se pudo ${actionText} el usuario.`;
          alert(msg);
        }
      });
    }
  }
}
