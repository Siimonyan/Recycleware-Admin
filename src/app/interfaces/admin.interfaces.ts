export interface Usuario {
  id: number;
  nombre: string;
  dni: string;
  telefono: string;
  correo: string;
  direccion: string;
  localidad: string;
  codigoPostal: string;
  razonSocial?: string;
  nombreContacto?: string;
  rol: 'PARTICULAR' | 'EMPRESA' | 'ADMIN' | 'INVITADO';
  activo?: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  estado: any;
  disponibilidad: any;
  imagenUrl?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Solicitud {
  id: number;
  applicant: Usuario;
  product: Producto;
  reason: string;
  state: any;
}

export interface Donacion {
  id: number;
  donante: Usuario;
  estado: any;
  fechaDonacion: string;
  cantidadProductos: number;
  descripcion: string;
  peso?: number;
  esAnonimo?: boolean;
}

export interface Mensaje {
  id: number;
  nombre: string;
  correo: string;
  asunto: string;
  mensaje: string;
  fechaEnvio?: string;
}
