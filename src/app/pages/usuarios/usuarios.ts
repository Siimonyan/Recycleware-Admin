import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
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
            <span class="input-group-text bg-transparent border-0"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control" placeholder="Buscar por nombre o correo..." [(ngModel)]="filterTerm">
          </div>
        </div>
        <button class="btn-primary" (click)="loadUsuarios()">
          <i class="bi bi-arrow-clockwise me-2"></i>
          Actualizar
        </button>
      </div>

      <div class="table-responsive">
        <table class="premium-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Localidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of filteredUsuarios()" class="animate-fade-in">
              <td><span class="text-muted">#{{ u.id }}</span></td>
              <td><span class="font-bold">{{ u.nombre }}</span></td>
              <td>{{ u.correo }}</td>
              <td>
                <span class="badge" [ngClass]="u.rol.toLowerCase()">{{ u.rol }}</span>
              </td>
              <td>{{ u.localidad || '—' }}</td>
              <td>
                <div class="table-actions">
                  <button (click)="editUsuario(u)" class="action-btn edit" title="Editar Datos">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button (click)="openRoleModal(u)" class="action-btn role" title="Cambiar Rol">
                    <i class="bi bi-shield-lock-fill"></i>
                  </button>
                  <button (click)="deleteUsuario(u.id)" class="action-btn delete" title="Eliminar">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Editar Usuario -->
    <div class="modal-overlay" *ngIf="showEditModal">
       <div class="modal-content animate-fade-in">
          <h3>Editar Usuario</h3>
          <p class="text-muted mb-4">Modifica los datos del usuario.</p>
          
          <div class="form-group">
            <label>Nombre Completo</label>
            <input type="text" class="form-control" [(ngModel)]="currentUser.nombre">
          </div>
          
          <div class="form-group">
            <label>Correo Electrónico</label>
            <input type="email" class="form-control" [(ngModel)]="currentUser.correo">
          </div>
          
          <div class="form-group">
            <label>Localidad</label>
            <input type="text" class="form-control" [(ngModel)]="currentUser.localidad">
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-light" (click)="closeEditModal()">Cancelar</button>
            <button class="btn-primary" (click)="saveUsuario()">Guardar Cambios</button>
          </div>
       </div>
    </div>

    <!-- Modal Cambiar Rol -->
    <div class="modal-overlay" *ngIf="showRoleModal">
       <div class="modal-content animate-fade-in">
          <h3>Cambiar Rol</h3>
          <p class="text-muted mb-4">Selecciona el nuevo rol para <strong>{{ roleUser.nombre }}</strong>.</p>
          
          <div class="form-group">
            <label>Nuevo Rol</label>
            <select class="form-control" [(ngModel)]="roleUser.rol">
              <option *ngFor="let rol of availableRoles" [value]="rol">{{ rol }}</option>
            </select>
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-light" (click)="closeRoleModal()">Cancelar</button>
            <button class="btn-primary" (click)="saveRole()">Asignar Rol</button>
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
  
  showRoleModal = false;
  roleUser: any = {};
  availableRoles = ['ADMIN', 'PARTICULAR', 'EMPRESA'];

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
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

  deleteUsuario(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.apiService.deleteUsuario(id).subscribe(() => this.loadUsuarios());
    }
  }
}
