import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { ExpedientesService } from '../../services/expedientes.service';

@Component({
  selector: 'app-expedientes',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './expedientes.component.html',
  styleUrl: './expedientes.component.css'
})
export class ExpedientesComponent implements OnInit {
  readonly statusCards = [
    { status: 'EXHORTO', label: 'Exhortos', icon: 'fa-file-circle-exclamation' },
    { status: 'EN_PROCESO', label: 'En proceso', icon: 'fa-briefcase' },
    { status: 'TERMINADO', label: 'Terminados', icon: 'fa-circle-check' },
    { status: 'ARCHIVADO', label: 'Archivados', icon: 'fa-box-archive' },
  ];

  stats = signal<{ total: number; porEstado: Record<string, number> } | null>(null);
  statsError = signal<string | null>(null);

  constructor(private router: Router, private expedientesService: ExpedientesService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  navigateTo(route: string): void {
    if (route === 'nuevoExpediente') {
      this.router.navigate(['/nuevoExpediente']);
      return;
    }

    this.router.navigate(['/expedientes/lista'], {
      queryParams: { status: route },
    });
  }

  private loadStats(): void {
    this.expedientesService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de expedientes:', error);
        this.statsError.set('No fue posible cargar las estadísticas.');
      },
    });
  }

  getCountForStatus(status: string): number {
    const current = this.stats();
    return current?.porEstado?.[status] ?? 0;
  }
}
