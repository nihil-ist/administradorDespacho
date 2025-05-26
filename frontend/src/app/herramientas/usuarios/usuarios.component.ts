import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [NavbarComponent, FormsModule, CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
  users: any[] = [];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getUsers().subscribe(
      (data) => {
        this.users = data; // Asignar los datos recibidos al array de usuarios
      },
      (error) => {
        console.error('Error al cargar los usuarios:', error);
      }
    );
  }

  // Método para eliminar un usuario del array local
  deleteUser(user: any): void {
    console.log(user._id)
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.authService.deleteUser(user._id).subscribe(
        (response) => {
          alert(response.message); // Mensaje de confirmación
          this.loadUsers(); // Volver a cargar los usuarios
        },
        (error) => {
          console.error('Error al eliminar el usuario:', error);
          alert('Hubo un problema al eliminar el usuario.');
        }
      );
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

}
