import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  login(user: string, pass: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { usuario: user, contrasena: pass });
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getUsers`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  addUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, user);
  }
}
