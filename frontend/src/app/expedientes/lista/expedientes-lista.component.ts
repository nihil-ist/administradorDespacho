import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { NavbarComponent } from '../../navbar/navbar.component';
import { ExpedientesService } from '../../../services/expedientes.service';
import { Expediente, ExpedienteEstado } from '../../models/expediente.model';

@Component({
  selector: 'app-expedientes-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterLink],
  templateUrl: './expedientes-lista.component.html',
  styleUrl: './expedientes-lista.component.css'
})
export class ExpedientesListaComponent implements OnInit, OnDestroy {
  readonly estados: (ExpedienteEstado | 'TODOS')[] = ['TODOS', 'EXHORTO', 'EN_PROCESO', 'TERMINADO', 'ARCHIVADO'];
  readonly etiquetasEstados: Record<ExpedienteEstado | 'TODOS', string> = {
    TODOS: 'Todos',
    EXHORTO: 'Exhortos',
    EN_PROCESO: 'En proceso',
    TERMINADO: 'Terminados',
    ARCHIVADO: 'Archivados',
  };

  readonly coloresEstado: Record<ExpedienteEstado, string> = {
    EXHORTO: 'badge-warning',
    EN_PROCESO: 'badge-info',
    TERMINADO: 'badge-success',
    ARCHIVADO: 'badge-muted',
  };

  private destroy$ = new Subject<void>();

  expedientes = signal<Expediente[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  filtroEstado = signal<ExpedienteEstado | 'TODOS'>('TODOS');

  searchControl = new FormControl('', { nonNullable: true });
  totalRegistros = computed(() => this.expedientes().length);

  constructor(
    private readonly expedientesService: ExpedientesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const estado = (params.get('status') || 'TODOS').toUpperCase() as ExpedienteEstado | 'TODOS';
      this.filtroEstado.set(this.estados.includes(estado) ? estado : 'TODOS');
      this.cargarExpedientes();
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.cargarExpedientes();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cambiarEstado(estado: ExpedienteEstado | 'TODOS'): void {
    if (this.filtroEstado() === estado) {
      return;
    }

    const queryParams = estado === 'TODOS' ? { status: null } : { status: estado };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  private cargarExpedientes(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const filtros = {
      status: this.filtroEstado() === 'TODOS' ? undefined : this.filtroEstado(),
      search: this.searchControl.value?.trim() || undefined,
    };

    this.expedientesService.getExpedientes(filtros).subscribe({
      next: (expedientes) => {
        this.expedientes.set(expedientes);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al obtener expedientes:', err);
        this.error.set('No fue posible cargar los expedientes. Intenta más tarde.');
        this.isLoading.set(false);
      },
    });
  }

  trackByExpedienteId(_index: number, expediente: Expediente): string {
    return expediente._id;
  }

  etiquetaEstado(estado: ExpedienteEstado): string {
    return this.etiquetasEstados[estado];
  }

  colorBadge(estado: ExpedienteEstado): string {
    return this.coloresEstado[estado] || 'badge-muted';
  }

  limpiarBusqueda(): void {
    this.searchControl.setValue('');
  }
}
