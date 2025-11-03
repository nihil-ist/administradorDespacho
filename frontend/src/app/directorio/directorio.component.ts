import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-directorio',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './directorio.component.html',
  styleUrl: './directorio.component.css'
})
export class DirectorioComponent {
  searchTerm: string = '';

  clientes = [
    {
      nombre: 'Carlos Gómez',
      telefono: '555-123-4567',
      email: 'carlos.gomez@correo.com',
      empresa: 'Bufete Legal Gómez & Asociados',
      foto: 'assets/muriel.jpg'
    },
    {
      nombre: 'María López',
      telefono: '555-987-6543',
      email: 'maria.lopez@correo.com',
      empresa: 'Consultoría Jurídica López',
      foto: 'assets/diega.jpg'
    },
    {
      nombre: 'Juan Pérez',
      telefono: '555-111-2222',
      email: 'juan.perez@correo.com',
      empresa: 'Asesoría Legal Integral',
      foto: 'assets/caca.jpg'
    }
  ];

  constructor(private router: Router) {}

  filteredClientes() {
    const term = this.searchTerm.toLowerCase();
    return this.clientes.filter(c =>
      c.nombre.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.empresa.toLowerCase().includes(term)
    );
  }

  verDetalles(cliente: any) {
    alert(`Detalles de ${cliente.nombre}\nEmail: ${cliente.email}\nTeléfono: ${cliente.telefono}`);
  }

  editarCliente(cliente: any) {
    alert(`Editar información de ${cliente.nombre}`);
    // Más adelante: this.router.navigate(['/directorio/editar', cliente.id]);
  }
}
