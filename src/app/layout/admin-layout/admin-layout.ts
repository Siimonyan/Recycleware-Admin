import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./admin-layout.scss'],
  template: `
    <div class="admin-wrapper">
      <!-- Mobile Overlay -->
      <div class="mobile-overlay" *ngIf="isSidebarOpen" (click)="toggleSidebar()"></div>

      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="isSidebarOpen">
        <div class="sidebar-header">
          <img src="assets/img/logo-entero.png" alt="Logo" class="sidebar-logo">
          <button class="close-sidebar-btn" (click)="toggleSidebar()">✕</button>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="dashboard" routerLinkActive="active" class="nav-item" (click)="onNavItemClick('Dashboard')">
            <i class="bi bi-grid-fill"></i>
            Dashboard
          </a>
          <a routerLink="usuarios" routerLinkActive="active" class="nav-item" (click)="onNavItemClick('Usuarios')">
            <i class="bi bi-people-fill"></i>
            Usuarios
          </a>
          <a routerLink="productos" routerLinkActive="active" class="nav-item" (click)="onNavItemClick('Productos')">
            <i class="bi bi-box-seam-fill"></i>
            Productos
          </a>
          <a routerLink="categorias" routerLinkActive="active" class="nav-item" (click)="onNavItemClick('Categorías')">
            <i class="bi bi-tags-fill"></i>
            Categorías
          </a>
          <a routerLink="solicitudes" routerLinkActive="active" class="nav-item" (click)="onNavItemClick('Solicitudes')">
            <i class="bi bi-file-earmark-text-fill"></i>
            Solicitudes
          </a>
          <a routerLink="donaciones" routerLinkActive="active" class="nav-item" (click)="onNavItemClick('Donaciones')">
            <i class="bi bi-heart-fill"></i>
            Donaciones
          </a>
          <a routerLink="mensajes" routerLinkActive="active" class="nav-item" (click)="onNavItemClick('Mensajes')">
            <i class="bi bi-envelope-fill"></i>
            Mensajes
          </a>
          <a routerLink="perfil" routerLinkActive="active" class="nav-item" (click)="onNavItemClick('Mi Perfil')">
            <i class="bi bi-person-fill-gear"></i>
            Mi Perfil
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <p class="user-name">{{ userName }}</p>
            <p class="user-role">Administrador</p>
          </div>
          <button (click)="logout()" class="logout-btn" title="Cerrar Sesión">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="content-header">
          <div class="d-flex align-items-center gap-3">
            <button class="menu-toggle-btn" (click)="toggleSidebar()">
              <i class="bi bi-list"></i>
            </button>
            <h1 class="animate-fade-in">{{ currentTitle }}</h1>
          </div>
          
          <div class="header-actions d-none d-md-flex align-items-center gap-3">
             <span class="badge bg-primary">Admin Panel</span>
          </div>
        </header>
        <section class="content-body animate-fade-in">
          <router-outlet></router-outlet>
        </section>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  userName = 'Admin';
  currentTitle = 'Dashboard';
  isSidebarOpen = false;

  private titleMap: { [key: string]: string } = {
    '/admin/dashboard': 'Dashboard',
    '/admin/usuarios': 'Usuarios',
    '/admin/productos': 'Productos',
    '/admin/categorias': 'Categorías',
    '/admin/solicitudes': 'Solicitudes',
    '/admin/donaciones': 'Donaciones',
    '/admin/mensajes': 'Mensajes',
    '/admin/perfil': 'Mi Perfil'
  };

  constructor(private authService: AuthService, public router: Router) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.nombre;
      }
    });

    this.updateTitleFromUrl(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTitleFromUrl(event.urlAfterRedirects);
    });
  }

  setTitle(title: string) {
    this.currentTitle = title;
  }

  onNavItemClick(title: string) {
    this.setTitle(title);
    if (window.innerWidth <= 900) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private updateTitleFromUrl(url: string) {
    const title = this.titleMap[url];
    if (title) this.currentTitle = title;
  }

  logout() {
    this.authService.logout();
  }
}
