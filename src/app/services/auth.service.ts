import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, of, catchError, BehaviorSubject, switchMap, throwError } from 'rxjs';
import { Usuario } from '../interfaces/admin.interfaces';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const savedUser = localStorage.getItem('admin_user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/login`, credentials, { withCredentials: true }).pipe(
      switchMap(response => {
        if (response.rol === 'ADMIN') {
          this.currentUserSubject.next(response);
          localStorage.setItem('admin_user', JSON.stringify(response));
          return of(response);
        } else {
          // El usuario existe y la contraseña es correcta, pero no tiene rol ADMIN
          return throwError(() => ({ status: 403, error: { message: 'No tienes permisos de administrador' } }));
        }
      })
    );
  }

  logout() {
    this.http.post(`${this.authUrl}/logout`, {}, { withCredentials: true }).subscribe();
    this.currentUserSubject.next(null);
    localStorage.removeItem('admin_user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value && this.currentUserSubject.value.rol === 'ADMIN';
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(user: Usuario) {
    this.currentUserSubject.next(user);
    localStorage.setItem('admin_user', JSON.stringify(user));
  }

  checkSession(): Observable<boolean> {
    return this.http.get<any>(`${this.authUrl}/user`, { withCredentials: true }).pipe(
      map(user => {
        if (user && user.rol === 'ADMIN') {
          this.currentUserSubject.next(user);
          localStorage.setItem('admin_user', JSON.stringify(user));
          return true;
        }
        this.logout();
        return false;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }
}
