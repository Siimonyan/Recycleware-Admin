import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Categoria } from '../../interfaces/admin.interfaces';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./categorias.scss'],
  template: `
    <div class="premium-card">
      <div class="table-header">
        <h3>Gestión de Categorías</h3>
        <button class="btn-primary" (click)="showModal = true">
          <i class="bi bi-plus-lg me-2"></i>
          Nueva Categoría
        </button>
      </div>

      <div class="table-responsive">
        <table class="premium-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th class="text-center">Artículos</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of categorias" class="animate-fade-in">
              <td><span class="text-muted">#{{ c.id }}</span></td>
              <td><span class="font-bold">{{ c.nombre }}</span></td>
              <td class="text-center">
                <span class="count-badge">{{ getProductCount(c.id) }}</span>
              </td>
              <td>
                <div class="table-actions">
                  <button class="action-btn" (click)="editCategory(c)" title="Editar">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button class="action-btn delete" (click)="deleteCategory(c.id)" title="Eliminar">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Categoría -->
    <div class="modal-overlay" *ngIf="showModal">
       <div class="modal-content animate-fade-in">
          <h3>{{ currentCategory.id ? 'Editar' : 'Nueva' }} Categoría</h3>
          <p class="text-muted mb-4">Define el nombre de la categoría.</p>
          
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" class="form-control" [(ngModel)]="currentCategory.nombre" placeholder="Ej: Electrónica, Muebles...">
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-light" (click)="closeModal()">Cancelar</button>
            <button class="btn-primary" (click)="saveCategory()">Guardar</button>
          </div>
       </div>
    </div>
  `
})
export class CategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  productos: any[] = [];
  showModal = false;
  currentCategory: any = { nombre: '' };

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCategorias();
  }

  loadCategorias() {
    this.apiService.getCategorias().subscribe(res => {
      this.categorias = res;
      this.cdr.detectChanges();
    });
    this.apiService.getProductos().subscribe(res => {
      this.productos = res;
      this.cdr.detectChanges();
    });
  }

  getProductCount(categoriaId: number): number {
    return this.productos.filter(p => p.categoria && p.categoria.id === categoriaId).length;
  }

  editCategory(cat: Categoria) {
    this.currentCategory = { ...cat };
    this.showModal = true;
  }

  saveCategory() {
    if (!this.currentCategory.nombre.trim()) return;
    this.apiService.saveCategoria(this.currentCategory).subscribe(() => {
      this.loadCategorias();
      this.closeModal();
    });
  }

  deleteCategory(id: number) {
    if (confirm('¿Eliminar esta categoría? Se ocultarán los productos asociados.')) {
      this.apiService.deleteCategoria(id).subscribe(() => this.loadCategorias());
    }
  }

  closeModal() {
    this.showModal = false;
    this.currentCategory = { nombre: '' };
  }
}
