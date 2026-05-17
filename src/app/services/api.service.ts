import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, Producto, Categoria, Solicitud, Donacion, Mensaje } from '../interfaces/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  // Estadísticas
  getStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/estadisticas`, { withCredentials: true });
  }

  // Mensajes
  getMensajes(): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.baseUrl}/mensajes`, { withCredentials: true });
  }

  responderMensaje(id: number, respuesta: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/mensajes/${id}`, { respuesta }, { withCredentials: true });
  }

  // Usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`, { withCredentials: true });
  }

  updateUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/usuarios/${id}`, usuario, { withCredentials: true });
  }

  updateRol(id: number, rol: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/usuarios/${id}/rol`, { rol }, { withCredentials: true });
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/usuarios/${id}`, { withCredentials: true });
  }

  updateProfile(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`http://localhost:8080/api/usuario`, usuario, { withCredentials: true });
  }

  // Productos
  getProductos(categoria?: string, estado?: string): Observable<Producto[]> {
    let params: any = {};
    if (categoria) params.categoria = categoria;
    if (estado) params.estado = estado;
    return this.http.get<Producto[]>(`${this.baseUrl}/productos`, { params, withCredentials: true });
  }

  getProductStates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/productos/estados`, { withCredentials: true });
  }

  getProductAvailabilities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/productos/disponibilidades`, { withCredentials: true });
  }

  saveProducto(producto: Partial<Producto>): Observable<Producto> {
    if (producto.id) {
      return this.http.put<Producto>(`${this.baseUrl}/productos/${producto.id}`, producto, { withCredentials: true });
    }
    return this.http.post<Producto>(`${this.baseUrl}/productos`, producto, { withCredentials: true });
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/productos/${id}`, { withCredentials: true });
  }

  uploadProductoImagen(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/productos/${id}/imagen`, formData, { withCredentials: true });
  }

  // Categorías
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`, { withCredentials: true });
  }

  saveCategoria(categoria: Partial<Categoria>): Observable<Categoria> {
    if (categoria.id) {
      return this.http.put<Categoria>(`${this.baseUrl}/categorias/${categoria.id}`, categoria, { withCredentials: true });
    }
    return this.http.post<Categoria>(`${this.baseUrl}/categorias`, categoria, { withCredentials: true });
  }

  deleteCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categorias/${id}`, { withCredentials: true });
  }

  // Solicitudes
  getSolicitudes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.baseUrl}/solicitudes`, { withCredentials: true });
  }

  updateSolicitudEstado(id: number, idEstado: number): Observable<Solicitud> {
    return this.http.put<Solicitud>(`${this.baseUrl}/solicitudes/${id}/estado`, { idEstado }, { withCredentials: true });
  }

  deleteSolicitud(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/solicitudes/${id}`, { withCredentials: true });
  }

  // Donaciones
  getDonaciones(): Observable<Donacion[]> {
    return this.http.get<Donacion[]>(`${this.baseUrl}/donaciones`, { withCredentials: true });
  }

  updateDonacionEstado(id: number, idEstado: number): Observable<Donacion> {
    return this.http.put<Donacion>(`${this.baseUrl}/donaciones/${id}/estado`, { idEstado }, { withCredentials: true });
  }

  deleteDonacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/donaciones/${id}`, { withCredentials: true });
  }
}
