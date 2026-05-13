import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/usuarios/usuarios').then(m => m.UsuariosComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/productos/productos').then(m => m.ProductosComponent)
      },
      {
        path: 'categorias',
        loadComponent: () => import('./pages/categorias/categorias').then(m => m.CategoriasComponent)
      },
      {
        path: 'solicitudes',
        loadComponent: () => import('./pages/solicitudes/solicitudes').then(m => m.SolicitudesComponent)
      },
      {
        path: 'donaciones',
        loadComponent: () => import('./pages/donaciones/donaciones').then(m => m.DonacionesComponent)
      },
      {
        path: 'mensajes',
        loadComponent: () => import('./pages/mensajes/mensajes').then(m => m.MensajesComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil').then(m => m.PerfilComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'admin'
  }
];
