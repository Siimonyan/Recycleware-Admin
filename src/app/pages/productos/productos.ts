import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Producto, Categoria } from '../../interfaces/admin.interfaces';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./productos.scss'],
  template: `
    <div class="premium-card">
      <div class="table-header">
        <div class="search-box">
          <div class="input-group">
            <span class="input-group-text bg-transparent border-0"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control" placeholder="Buscar por nombre..." [(ngModel)]="filterTerm">
          </div>
        </div>
        <div class="filters">
          <select class="form-control" [(ngModel)]="selectedCategoria" (change)="loadProductos()">
            <option value="">Todas las Categorías</option>
            <option *ngFor="let cat of categorias" [value]="cat.nombre">{{ cat.nombre }}</option>
          </select>
        </div>
        <button class="btn-primary" (click)="showCreateModal = true">
          <i class="bi bi-plus-lg me-2"></i>
          Nuevo Producto
        </button>
      </div>

      <div class="table-responsive">
        <table class="premium-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredProductos()" class="animate-fade-in">
              <td><span class="text-muted">#{{ p.id }}</span></td>
              <td>
                <img [src]="getProductImage(p.imagenUrl)" class="product-img clickable-img" alt="prod" (error)="handleImgError($event)" (click)="viewImage(getProductImage(p.imagenUrl))">
              </td>
              <td>
                <p class="font-bold">{{ p.nombre }}</p>
                <p class="text-xs">{{ p.descripcion | slice:0:40 }}...</p>
              </td>
              <td>
                <span class="cat-badge">{{ p.categoria.nombre }}</span>
              </td>
              <td>
                <div class="d-flex align-items-center">
                  <span class="status-dot" [ngClass]="p.disponibilidad.nombre === 'Disponible' ? 'bg-green' : 'bg-red'"></span>
                  <span class="small font-weight-bold">{{ p.disponibilidad.nombre }}</span>
                </div>
              </td>
              <td>
                <div class="table-actions">
                  <button class="action-btn" (click)="editProduct(p)" title="Editar">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button class="action-btn delete" (click)="deleteProduct(p.id)" title="Eliminar">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Producto -->
    <div class="modal-overlay" *ngIf="showCreateModal">
       <div class="modal-content animate-fade-in">
          <h3>{{ editingProduct ? 'Editar' : 'Nuevo' }} Producto</h3>
          <p class="text-muted mb-4">Completa la información del producto.</p>
          
          <div class="form-group">
            <label>Nombre del Producto</label>
            <input type="text" class="form-control" [(ngModel)]="currentProduct.nombre">
          </div>
          
          <div class="form-group">
            <label>Descripción</label>
            <textarea class="form-control" [(ngModel)]="currentProduct.descripcion" rows="3"></textarea>
          </div>
          
          <div class="form-group">
            <label>Categoría</label>
            <select class="form-control" [(ngModel)]="currentProduct.categoria.id">
              <option value="0" disabled>Selecciona una categoría...</option>
              <option *ngFor="let cat of categorias" [value]="cat.id">{{ cat.nombre }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Imágenes</label>
            <input type="file" class="form-control" multiple accept="image/*" (change)="onFileSelected($event)">
          </div>
          
          <div class="image-previews" *ngIf="previewImages.length > 0">
            <div class="preview-container" *ngFor="let src of previewImages; let i = index">
              <img [src]="src" class="preview-img" alt="preview">
              <button class="remove-btn" (click)="removeImage(i)"><i class="bi bi-x"></i></button>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-light" (click)="closeModal()">Cancelar</button>
            <button class="btn-primary" (click)="saveProduct()">{{ editingProduct ? 'Actualizar' : 'Guardar' }}</button>
          </div>
       </div>
    </div>

    <!-- Modal de Imagen -->
    <div class="modal-overlay" *ngIf="showImageModal" (click)="showImageModal = false">
       <div class="zoom-modal-content" (click)="$event.stopPropagation()">
          <img [src]="selectedImage" class="zoomed-img" alt="Zoomed Product">
          <button class="close-zoom-btn" (click)="showImageModal = false"><i class="bi bi-x-lg"></i></button>
       </div>
    </div>
  `
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  filterTerm = '';
  selectedCategoria = '';
  showCreateModal = false;
  editingProduct = false;
  currentProduct: any = { nombre: '', descripcion: '', categoria: { id: 0 } };
  previewImages: string[] = [];
  selectedFiles: File[] = [];
  
  // Nuevos estados
  showImageModal = false;
  selectedImage = '';
  showInfoModal = false;
  selectedInfoProduct: Producto | null = null;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadProductos();
    this.apiService.getCategorias().subscribe(res => {
      this.categorias = res;
      this.cdr.detectChanges();
    });
  }

  loadProductos() {
    this.apiService.getProductos(this.selectedCategoria).subscribe(res => {
      this.productos = res;
      this.cdr.detectChanges();
    });
  }

  filteredProductos() {
    return this.productos.filter(p => p.nombre.toLowerCase().includes(this.filterTerm.toLowerCase()));
  }

  viewImage(imgSrc: string) {
    this.selectedImage = imgSrc;
    this.showImageModal = true;
  }

  viewInfo(producto: Producto) {
    this.selectedInfoProduct = producto;
    this.showInfoModal = true;
  }

  editProduct(producto: Producto) {
    this.editingProduct = true;
    this.currentProduct = { ...producto };
    if (!this.currentProduct.categoria) {
      this.currentProduct.categoria = { id: 0 };
    }
    this.previewImages = [];
    if (this.currentProduct.imagenUrl) {
      this.previewImages.push(this.getProductImage(this.currentProduct.imagenUrl));
    }
    this.showCreateModal = true;
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files);
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewImages.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  removeImage(index: number) {
    this.previewImages.splice(index, 1);
  }

  saveProduct() {
    this.apiService.saveProducto(this.currentProduct).subscribe((res) => {
      if (this.selectedFiles.length > 0) {
        this.apiService.uploadProductoImagen(res.id, this.selectedFiles[0]).subscribe(() => {
          this.loadProductos();
          this.closeModal();
        });
      } else {
        this.loadProductos();
        this.closeModal();
      }
    });
  }

  deleteProduct(id: number) {
    if (confirm('¿Eliminar este producto?')) {
      this.apiService.deleteProducto(id).subscribe(() => this.loadProductos());
    }
  }

  closeModal() {
    this.showCreateModal = false;
    this.editingProduct = false;
    this.currentProduct = { nombre: '', descripcion: '', categoria: { id: 0 } };
    this.previewImages = [];
    this.selectedFiles = [];
  }

  getProductImage(img: string | undefined): string {
    if (!img) return 'https://img.icons8.com/fluency/48/box.png';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/api/images')) return `http://localhost:8080${img}`;
    return `http://localhost:8080/uploads/productos/${img}`;
  }

  handleImgError(event: any) {
    event.target.src = 'https://img.icons8.com/fluency/48/box.png';
  }
}
