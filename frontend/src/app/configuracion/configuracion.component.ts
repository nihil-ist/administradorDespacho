import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css'
})
export class ConfiguracionComponent {
  seccion: string = 'perfil';
  tema: string = 'claro';

  perfil = {
    nombre: 'Abogado Ejemplo',
    correo: 'abogado@despacho.com',
    telefono: '555-123-4567'
  };

  notificaciones = {
    email: true,
    agenda: true,
    actualizaciones: false
  };

  cambiarSeccion(nombre: string) {
    this.seccion = nombre;
  }

  guardarCambios() {
    alert('Cambios de perfil guardados correctamente.');
  }

  guardarTema() {
    alert(`Tema "${this.tema}" aplicado.`);
  }

  guardarNotificaciones() {
    alert('Preferencias de notificaciones actualizadas.');
  }
}
