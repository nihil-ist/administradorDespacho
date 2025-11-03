import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './soporte.component.html',
  styleUrl: './soporte.component.css'
})
export class SoporteComponent {
  ticket = {
    nombre: 'Abogado Ejemplo',
    correo: 'abogado@despacho.com',
    asunto: 'Problema con expediente',
    mensaje: ''
  };

  faqs = [
    { pregunta: '¿Cómo crear un nuevo expediente?', respuesta: 'Ve a la sección de Directorio y haz clic en "Nuevo expediente".', abierto: false },
    { pregunta: '¿Cómo asignar tareas a los abogados?', respuesta: 'En la Agenda, selecciona la fecha y crea un evento asignando el abogado responsable.', abierto: false },
    { pregunta: '¿Puedo cambiar mi contraseña?', respuesta: 'Sí, en Configuración → Seguridad puedes actualizar tu contraseña.', abierto: false }
  ];

  enviarTicket() {
    alert(`Ticket enviado!\nAsunto: ${this.ticket.asunto}\nMensaje: ${this.ticket.mensaje}`);
    this.ticket.mensaje = ''; // Limpiar textarea
  }
}
