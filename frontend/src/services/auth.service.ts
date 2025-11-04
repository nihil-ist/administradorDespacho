import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthUser } from '../app/models/user.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrl = environment.apiBaseUrl;
  private storageKey = 'administrador-despacho-user';
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadStoredUser());

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(user: string, pass: string): Observable<{ message: string; user: AuthUser }> {
    return this.http
      .post<{ message: string; user: AuthUser }>(`${this.apiUrl}/auth/login`, {
        usuario: user,
        contrasena: pass,
      })
      .pipe(
        tap((response) => {
          this.setCurrentUser(response.user);
        })
      );
  }

  logout(): void {
    this.persistUser(null);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user || !roles?.length) {
      return false;
    }

    const userRole = this.normalizeRole(user.tipo);
    return roles.some((role) => this.normalizeRole(role) === userRole);
  }

  hasRole(role: string): boolean {
    return this.hasAnyRole([role]);
  }

  isAdmin(): boolean {
    return this.hasAnyRole(['ADMINISTRADOR']);
  }

  getAssignmentIdentifier(): string | undefined {
    const user = this.currentUserSubject.value;
    if (!user) {
      return undefined;
    }

    return user.nombre?.trim() || user.usuario?.trim();
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  addUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, user);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, user);
  }

  private setCurrentUser(user: AuthUser): void {
    const normalized: AuthUser = {
      ...user,
      tipo: this.normalizeRole(user.tipo),
    };
    this.persistUser(normalized);
    this.currentUserSubject.next(normalized);
  }

  private loadStoredUser(): AuthUser | null {
    if (!this.hasStorage()) {
      return null;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return null;
      }
      const parsed = JSON.parse(stored) as AuthUser;
      if (!parsed || !parsed._id) {
        return null;
      }
      return {
        ...parsed,
        tipo: this.normalizeRole(parsed.tipo),
      };
    } catch (error) {
      console.warn('No fue posible cargar la sesión almacenada:', error);
      return null;
    }
  }

  private persistUser(user: AuthUser | null): void {
    if (!this.hasStorage()) {
      return;
    }

    if (!user) {
      localStorage.removeItem(this.storageKey);
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  private normalizeRole(role: string | undefined | null): string {
    return role ? role.toString().trim().toUpperCase() : '';
  }

  private hasStorage(): boolean {
    try {
      return typeof window !== 'undefined' && !!window.localStorage;
    } catch {
      return false;
    }
  }
}
