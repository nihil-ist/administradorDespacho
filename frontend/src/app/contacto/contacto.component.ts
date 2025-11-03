import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent {
  mensaje = {
    nombre: '',
    correo: '',
    asunto: '',
    mensaje: ''
  };

  enviarMensaje() {
    alert(`Mensaje enviado!\nNombre: ${this.mensaje.nombre}\nAsunto: ${this.mensaje.asunto}\nMensaje: ${this.mensaje.mensaje}`);
    this.mensaje = { nombre: '', correo: '', asunto: '', mensaje: '' }; // Limpiar formulario
  }
}
