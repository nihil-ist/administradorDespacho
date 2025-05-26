import { Component } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [NavbarComponent, FormsModule, CommonModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent {
  user: any = {
    usuario: '',
    contrasena: '',
    correo: '',
    tipo: '',
    nombre: ''
  };
  confirmPassword: string = '';

  constructor(private router: Router, private authService:AuthService) {}

  addUser(): void {
    if (this.user.contrasena !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    this.authService.addUser(this.user).subscribe(
      (response) => {
        alert(response.message); // Mostrar el mensaje del backend
        this.router.navigate(['/usuarios']); // Redirigir a la lista de usuarios
      },
      (error) => {
        console.error('Error al agregar el usuario:', error);
        alert(
          error.error.message || 'Ocurrió un error al agregar el usuario.'
        );
      }
    );
    //this.router.navigate(['/usuarios']);
  }
}
