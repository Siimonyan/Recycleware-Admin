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
            <span class="input-group-text bg-transparent border-0"><i class="bi bi-search" aria-hidden="true"></i></span>
            <input id="productSearchInput" type="text" class="form-control" placeholder="Buscar por nombre..." [(ngModel)]="filterTerm" aria-label="Buscar productos">
          </div>
        </div>
        <div class="filters">
          <label for="catFilterSelect" class="visually-hidden">Filtrar por categoría</label>
          <select id="catFilterSelect" class="form-control" [(ngModel)]="selectedCategoria" (change)="loadProductos()">
            <option value="">Todas las Categorías</option>
            <option *ngFor="let cat of categorias" [value]="cat.nombre">{{ cat.nombre }}</option>
          </select>
        </div>
        <button id="newProductBtn" class="btn btn-primary" (click)="showCreateModal = true" aria-label="Añadir nuevo producto">
          <i class="bi bi-plus-lg me-2" aria-hidden="true"></i>
          Nuevo Producto
        </button>
      </div>

      <div class="table-responsive">
        <table class="premium-table" aria-label="Listado de productos disponibles">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Imagen</th>
               <th scope="col">Nombre</th>
               <th scope="col">Categoría</th>
               <th scope="col">Estado</th>
               <th scope="col">Disponibilidad</th>
               <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredProductos()" class="animate-fade-in">
              <td><span class="text-muted">#{{ p.id }}</span></td>
              <td>
                <img [src]="getProductImage(p.imagenUrl)" class="product-img clickable-img" [attr.alt]="'Imagen de ' + p.nombre" (error)="handleImgError($event)" (click)="viewImage(getProductImage(p.imagenUrl))" tabindex="0" (keyup.enter)="viewImage(getProductImage(p.imagenUrl))">
              </td>
              <td>
                <p class="font-bold">{{ p.nombre }}</p>
                <p class="text-xs">{{ p.descripcion | slice:0:40 }}...</p>
              </td>
              <td>
                <span class="cat-badge">{{ p.categoria.nombre }}</span>
              </td>
               <td>
                 <span class="state-badge">{{ p.estado?.nombre || 'N/A' }}</span>
               </td>
               <td>
                 <div class="d-flex align-items-center">
                   <span class="status-dot" [ngClass]="p.disponibilidad?.nombre === 'Disponible' ? 'bg-green' : 'bg-red'" aria-hidden="true"></span>
                   <span class="small font-weight-bold">{{ p.disponibilidad?.nombre || 'N/A' }}</span>
                 </div>
               </td>
              <td>
                <div class="table-actions">
                  <button [id]="'editProdBtn-' + p.id" class="action-btn" (click)="editProduct(p)" title="Editar" [attr.aria-label]="'Editar producto ' + p.nombre">
                    <i class="bi bi-pencil-fill" aria-hidden="true"></i>
                  </button>
                  <button [id]="'deleteProdBtn-' + p.id" class="action-btn delete" (click)="deleteProduct(p.id)" title="Eliminar" [attr.aria-label]="'Eliminar producto ' + p.nombre">
                    <i class="bi bi-trash-fill" aria-hidden="true"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Producto -->
    <div class="modal-overlay" *ngIf="showCreateModal" role="dialog" aria-labelledby="productModalTitle">
       <div class="modal-content animate-fade-in">
          <h3 id="productModalTitle">{{ editingProduct ? 'Editar' : 'Nuevo' }} Producto</h3>
          <p class="text-muted mb-4">Completa la información del producto.</p>
          
           <div class="form-group">
            <label for="prodNameInput">Nombre del Producto *</label>
            <input id="prodNameInput" type="text" class="form-control" [class.is-invalid]="formSubmitted && !currentProduct.nombre" [(ngModel)]="currentProduct.nombre" placeholder="Ej: Ratón Gaming">
            <div class="invalid-feedback" *ngIf="formSubmitted && !currentProduct.nombre">El nombre es obligatorio</div>
          </div>
          
          <div class="form-group">
            <label for="prodDescInput">Descripción *</label>
            <textarea id="prodDescInput" class="form-control" [class.is-invalid]="formSubmitted && !currentProduct.descripcion" [(ngModel)]="currentProduct.descripcion" rows="3" placeholder="Describe las características..."></textarea>
            <div class="invalid-feedback" *ngIf="formSubmitted && !currentProduct.descripcion">La descripción es obligatoria</div>
          </div>
          
          <div class="form-group">
            <label for="prodCatSelect">Categoría *</label>
            <select id="prodCatSelect" class="form-control" [class.is-invalid]="formSubmitted && (!currentProduct.categoria || currentProduct.categoria.id === 0)" [(ngModel)]="currentProduct.categoria.id">
              <option value="0" disabled>Selecciona una categoría...</option>
              <option *ngFor="let cat of categorias" [value]="cat.id">{{ cat.nombre }}</option>
            </select>
            <div class="invalid-feedback" *ngIf="formSubmitted && (!currentProduct.categoria || currentProduct.categoria.id === 0)">Debes seleccionar una categoría</div>
          </div>
          
           <div class="form-row">
            <div class="form-group col-6">
               <label for="prodStateSelect">Estado</label>
               <select id="prodStateSelect" class="form-control" [(ngModel)]="currentProduct.estado.id">
                 <option *ngFor="let s of estados" [value]="s.id">{{ s.nombre }}</option>
               </select>
             </div>
             <div class="form-group col-6">
               <label for="prodDispSelect">Disponibilidad</label>
               <select id="prodDispSelect" class="form-control" [(ngModel)]="currentProduct.disponibilidad.id">
                 <option *ngFor="let d of disponibilidades" [value]="d.id">{{ d.nombre }}</option>
               </select>
             </div>
           </div>

           <div class="form-group">
             <label for="prodFileInput">Imágenes</label>
             <input id="prodFileInput" type="file" class="form-control" multiple accept="image/*" (change)="onFileSelected($event)">
           </div>
          
          <div class="image-previews" *ngIf="previewImages.length > 0">
            <div class="preview-container" *ngFor="let src of previewImages; let i = index">
              <img [src]="src" class="preview-img" alt="Vista previa de imagen seleccionada">
              <button class="remove-btn" (click)="removeImage(i)" aria-label="Eliminar imagen seleccionada"><i class="bi bi-x" aria-hidden="true"></i></button>
            </div>
          </div>
          
          <div class="modal-actions">
            <button id="cancelProdBtn" class="btn btn-light" (click)="closeModal()">Cancelar</button>
            <button id="saveProdBtn" class="btn btn-primary" (click)="saveProduct()">{{ editingProduct ? 'Actualizar' : 'Guardar' }}</button>
          </div>
       </div>
    </div>

    <!-- Modal de Imagen -->
    <div class="modal-overlay" *ngIf="showImageModal" (click)="showImageModal = false" role="dialog" aria-label="Visor de imagen ampliada">
       <div class="zoom-modal-content" (click)="$event.stopPropagation()">
          <img [src]="selectedImage" class="zoomed-img" alt="Imagen ampliada del producto">
          <button id="closeZoomBtn" class="close-zoom-btn" (click)="showImageModal = false" aria-label="Cerrar visor de imagen"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
       </div>
    </div>
  `
})
export class ProductosComponent implements OnInit {
   productos: Producto[] = [];
  categorias: Categoria[] = [];
  estados: any[] = [];
  disponibilidades: any[] = [];

  filterTerm = '';
  selectedCategoria = '';
  showCreateModal = false;
  editingProduct = false;
  currentProduct: any = { 
    nombre: '', 
    descripcion: '', 
    categoria: { id: 0 },
    estado: { id: 1 },
    disponibilidad: { id: 1 }
  };
  previewImages: string[] = [];
  selectedFiles: File[] = [];
  formSubmitted = false;
  

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
    this.apiService.getProductStates().subscribe(res => {
      this.estados = res;
      this.cdr.detectChanges();
    });
    this.apiService.getProductAvailabilities().subscribe(res => {
      this.disponibilidades = res;
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
    this.currentProduct = JSON.parse(JSON.stringify(producto));
    
    if (!this.currentProduct.categoria) this.currentProduct.categoria = { id: 0 };
    if (!this.currentProduct.estado) this.currentProduct.estado = { id: 1 };
    if (!this.currentProduct.disponibilidad) this.currentProduct.disponibilidad = { id: 1 };
    
    this.previewImages = [];
    if (this.currentProduct.imagenUrl) {
      this.previewImages.push(this.getProductImage(this.currentProduct.imagenUrl));
    }
    this.showCreateModal = true;
  }

   onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = [files[0]];
      this.previewImages = []; 
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImages = [e.target.result];
      };
      reader.readAsDataURL(files[0]);
    }
  }

  removeImage(index: number) {
    this.previewImages.splice(index, 1);
    this.selectedFiles.splice(index, 1);
    if (this.previewImages.length === 0) {
      this.currentProduct.imagenUrl = null;
    }
  }

  saveProduct() {
    this.formSubmitted = true;
    
    if (!this.currentProduct.nombre || !this.currentProduct.descripcion || !this.currentProduct.categoria.id || this.currentProduct.categoria.id === 0) {
      return;
    }

    this.apiService.saveProducto(this.currentProduct).subscribe({
      next: (res) => {
        if (this.selectedFiles.length > 0) {
          this.apiService.uploadProductoImagen(res.id, this.selectedFiles[0]).subscribe({
            next: () => {
              this.loadProductos();
              this.closeModal();
              alert('Producto guardado con éxito (incluyendo imagen).');
            },
            error: (err) => {
              console.error('Error al subir imagen:', err);
              alert('Producto guardado, pero no se pudo subir la imagen.');
              this.loadProductos();
              this.closeModal();
            }
          });
        } else {
          this.loadProductos();
          this.closeModal();
          alert('Producto guardado con éxito.');
        }
      },
      error: (err) => {
        console.error('Error al guardar producto:', err);
        const errorMsg = err.error?.message || err.error?.error || 'Error desconocido al guardar.';
        alert('No se pudo guardar el producto: ' + errorMsg);
      }
    });
  }

  deleteProduct(id: number) {
    if (confirm('¿Eliminar este producto?')) {
      this.apiService.deleteProducto(id).subscribe({
        next: () => this.loadProductos(),
        error: (err) => {
          console.error('Error al eliminar producto:', err);
          const msg = err.error?.error || 'No se pudo eliminar el producto. Puede tener solicitudes asociadas.';
          alert(msg);
        }
      });
    }
  }

   closeModal() {
    this.showCreateModal = false;
    this.editingProduct = false;
    this.formSubmitted = false;
    this.currentProduct = { 
      nombre: '', 
      descripcion: '', 
      categoria: { id: 0 },
      estado: { id: 1 },
      disponibilidad: { id: 1 }
    };
    this.previewImages = [];
    this.selectedFiles = [];
  }

  getProductImage(img: string | undefined): string {
    if (!img) return 'https://img.icons8.com/fluency/48/box.png';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/api/images')) return `http://localhost:8080${img}`;
    return `http://localhost:8080/api/uploads/productos/${img}`;
  }

  handleImgError(event: any) {
    event.target.src = 'https://img.icons8.com/fluency/48/box.png';
  }
}
