import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  isAuthenticated: boolean = false;
  role: string | null = null;
  name: string | null = null;
  menuOpen: boolean = false;

  constructor(private router: Router) {}
  
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // ngOnInit(): void {
  //   this.isAuthenticated = this.authService.isAuthenticated();
  //   this.role = this.authService.getRole();
  //   this.name = this.authService.getName();
  // }

  // logout(): void {
  //   this.authService.logout();
  //   this.isAuthenticated = false;
  //   this.router.navigate(['/home']);
  // }

  // goToRolePage(): void {
  //   if (this.role) {
  //     this.router.navigate([`/${this.role}`]);
  //   }
  // }
}
