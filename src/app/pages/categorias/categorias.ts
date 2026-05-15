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
        <button id="newCategoryBtn" class="btn-primary" (click)="showModal = true" aria-label="Añadir nueva categoría">
          <i class="bi bi-plus-lg me-2" aria-hidden="true"></i>
          Nueva Categoría
        </button>
      </div>

      <div class="table-responsive">
        <table class="premium-table" aria-label="Listado de categorías de productos">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre</th>
              <th scope="col" class="text-center">Artículos</th>
              <th scope="col" class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of categorias" class="animate-fade-in">
              <td><span class="text-muted">#{{ c.id }}</span></td>
              <td><span class="font-bold">{{ c.nombre }}</span></td>
              <td class="text-center">
                <span class="count-badge" [attr.aria-label]="getProductCount(c.id) + ' productos en esta categoría'">{{ getProductCount(c.id) }}</span>
              </td>
              <td>
                <div class="table-actions">
                  <button [id]="'editCatBtn-' + c.id" class="action-btn" (click)="editCategory(c)" title="Editar" [attr.aria-label]="'Editar categoría ' + c.nombre">
                    <i class="bi bi-pencil-fill" aria-hidden="true"></i>
                  </button>
                  <button [id]="'deleteCatBtn-' + c.id" class="action-btn delete" (click)="deleteCategory(c.id)" title="Eliminar" [attr.aria-label]="'Eliminar categoría ' + c.nombre">
                    <i class="bi bi-trash-fill" aria-hidden="true"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Categoría -->
    <div class="modal-overlay" *ngIf="showModal" role="dialog" aria-labelledby="modalTitle">
       <div class="modal-content animate-fade-in">
          <h3 id="modalTitle">{{ currentCategory.id ? 'Editar' : 'Nueva' }} Categoría</h3>
          <p class="text-muted mb-4">Define el nombre de la categoría.</p>
          
          <div class="form-group">
            <label for="catNameInput">Nombre</label>
            <input id="catNameInput" type="text" class="form-control" [(ngModel)]="currentCategory.nombre" placeholder="Ej: Electrónica, Muebles...">
          </div>
          
          <div class="modal-actions">
            <button id="cancelCatBtn" class="btn btn-light" (click)="closeModal()">Cancelar</button>
            <button id="saveCatBtn" class="btn-primary" (click)="saveCategory()" [disabled]="!currentCategory.nombre.trim()">Guardar</button>
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
    this.currentCategory = JSON.parse(JSON.stringify(cat));
    this.showModal = true;
  }

  saveCategory() {
    if (!this.currentCategory.nombre.trim()) return;

    const categoryToSave = {
      id: this.currentCategory.id,
      nombre: this.currentCategory.nombre.trim()
    };

    this.apiService.saveCategoria(categoryToSave).subscribe({
      next: () => {
        this.loadCategorias();
        this.closeModal();
        alert('Categoría guardada con éxito.');
      },
      error: (err) => {
        console.error('Error al guardar categoría:', err);
        const msg = err.error?.error || err.error?.message || 'Hubo un error al guardar la categoría. Asegúrate de que el nombre no esté duplicado.';
        alert(msg);
      }
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
