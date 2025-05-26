import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      user: ['', [Validators.required]],
      pass: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    console.log('dentro');
    if (this.loginForm.valid) {
      const { user, pass } = this.loginForm.value;
  
      this.authService.login(user, pass).subscribe({
        next: (response: any) => {
          console.log('Login exitoso', response);
          alert('Login exitoso. Bienvenido.');
        },
        error: (err: any) => {
          console.error('Error en el login:', err);
          alert('Error: Usuario o contraseña incorrectos');
        }
      });
    } else {
      console.error('Formulario inválido');
    }
  }
  
}
