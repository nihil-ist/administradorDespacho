import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  menuOpen: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}
  
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  currentUser(): AuthUser | null {
    return this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    this.menuOpen = false;
    this.router.navigate(['/login']);
  }
}
