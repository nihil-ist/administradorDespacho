import { Component } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-herramientas',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './home-herramientas.component.html',
  styleUrl: './home-herramientas.component.css'
})
export class HomeHerramientasComponent {

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }
}
