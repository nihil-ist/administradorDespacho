import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import esLocale from '@fullcalendar/core/locales/es';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavbarComponent } from '../navbar/navbar.component';
import { AgendaService, AGENDA_EVENT_TYPES } from '../../services/agenda.service';
import { AgendaEvent, AgendaEventPayload, AgendaEventType } from '../models/agenda-event.model';
import { ExpedientesService } from '../../services/expedientes.service';
import { Expediente } from '../models/expediente.model';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../models/user.model';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FullCalendarModule, ReactiveFormsModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css'
})
export class AgendaComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly eventTypes = AGENDA_EVENT_TYPES;
  readonly eventTypeLabels: Record<AgendaEventType, string> = {
    AUDIENCIA: 'Audiencia',
    CITA: 'Cita',
    REUNION: 'Reunión',
    TAREA: 'Tarea',
    OTRO: 'Otro',
  };

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin, bootstrap5Plugin],
    themeSystem: 'bootstrap5',
    locale: 'es',
    locales: [esLocale],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: '',
    },
    buttonText: {
      today: 'Hoy',
    },
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    selectable: true,
    eventDisplay: 'block',
    nowIndicator: true,
    expandRows: true,
    datesSet: (arg) => this.onDatesSet(arg),
    dateClick: (arg) => this.onDateClick(arg),
    eventClick: (arg) => this.onEventClick(arg),
    events: [],
  };

  eventForm: FormGroup;
  modalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  formError: string | null = null;
  formSubmitting = false;

  isLoadingEvents = false;
  eventsError: string | null = null;
  events: AgendaEvent[] = [];
  currentRange: { start?: string; end?: string } = {};

  selectedEvent: AgendaEvent | null = null;

  expedientes: Expediente[] = [];
  expedientesLoading = false;
  expedientesError: string | null = null;

  upcomingEvents: AgendaEvent[] = [];
  upcomingLoading = false;
  upcomingError: string | null = null;

  availableUsers: AuthUser[] = [];
  usersLoading = false;
  usersError: string | null = null;

  selectedOwnerId: string;
  readonly currentUserId: string | null;

  constructor(
    private fb: FormBuilder,
    private agendaService: AgendaService,
    private expedientesService: ExpedientesService,
    private authService: AuthService
  ) {
    this.eventForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(120)]],
      tipo: [this.eventTypes[0], Validators.required],
      fecha: ['', Validators.required],
      horaInicio: ['09:00', Validators.required],
      horaFin: [''],
      allDay: [false],
      expedienteId: [''],
      ubicacion: [''],
      descripcion: [''],
    });

    this.eventForm
      .get('allDay')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((allDay) => this.handleAllDayToggle(!!allDay));

    this.handleAllDayToggle(this.eventForm.get('allDay')?.value ?? false);

    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?._id ?? null;
    this.selectedOwnerId = this.authService.isAdmin() ? 'ALL' : (currentUser?._id ?? '');
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.fetchExpedientes();
    this.loadEvents();
    this.loadUpcomingEvents();
    if (this.isAdmin) {
      this.loadUsers();
    }
  }

  onDatesSet(arg: DatesSetArg): void {
    this.currentRange = { start: arg.startStr, end: arg.endStr };
    this.loadEvents();
  }

  onDateClick(arg: DateClickArg): void {
    this.openCreateModal(arg.dateStr);
  }

  onEventClick(arg: EventClickArg): void {
    this.focusEvent(arg.event.id);
  }

  openCreateModal(dateStr?: string): void {
    const targetDate = dateStr ?? this.todayAsInput();
    this.modalMode = 'create';
    this.formError = null;
    this.formSubmitting = false;
    this.selectedEvent = null;
    this.eventForm.reset({
      titulo: '',
      tipo: this.eventTypes[0],
      fecha: targetDate,
      horaInicio: '09:00',
      horaFin: '',
      allDay: false,
      expedienteId: '',
      ubicacion: '',
      descripcion: '',
    });
    this.modalOpen = true;
  }

  openEditModal(evento: AgendaEvent): void {
    this.modalMode = 'edit';
    this.formError = null;
    this.formSubmitting = false;
    this.selectedEvent = evento;

    this.eventForm.reset({
      titulo: evento.titulo,
      tipo: evento.tipo,
      fecha: this.formatDateInput(evento.fechaInicio),
      horaInicio: evento.allDay ? '' : this.formatTimeInput(evento.fechaInicio),
      horaFin: evento.allDay || !evento.fechaFin ? '' : this.formatTimeInput(evento.fechaFin),
      allDay: evento.allDay,
      expedienteId: evento.expediente?._id ?? '',
      ubicacion: evento.ubicacion ?? '',
      descripcion: evento.descripcion ?? '',
    });

    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  submitEvent(): void {
    this.formError = null;

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      this.formError = 'Completa los campos obligatorios para continuar.';
      return;
    }

    const valores = this.eventForm.value;
    const fecha = valores['fecha'];
    const titulo = (valores['titulo'] as string).trim();
    const tipo = valores['tipo'] as AgendaEventType;
    const allDay = !!valores['allDay'];
    const horaInicio = valores['horaInicio'] as string;
    const horaFin = valores['horaFin'] as string;
    const descripcion = (valores['descripcion'] as string)?.trim() || null;
    const ubicacion = (valores['ubicacion'] as string)?.trim() || null;
    const expedienteIdRaw = valores['expedienteId'] as string;

    if (!fecha) {
      this.formError = 'Selecciona una fecha para el evento.';
      return;
    }

    if (!allDay && !horaInicio) {
      this.formError = 'Define una hora de inicio o marca el evento como de todo el día.';
      return;
    }

    const fechaInicio = this.buildIsoDate(fecha, allDay ? '00:00' : horaInicio || '00:00');
    let fechaFin: string | null = null;

    if (!allDay && horaFin) {
      fechaFin = this.buildIsoDate(fecha, horaFin);
      if (new Date(fechaFin).getTime() <= new Date(fechaInicio).getTime()) {
        this.formError = 'La hora de fin debe ser posterior a la hora de inicio.';
        return;
      }
    }

    const payload: AgendaEventPayload = {
      titulo,
      tipo,
      fechaInicio,
      fechaFin: fechaFin ?? null,
      allDay,
      descripcion,
      ubicacion,
      expedienteId: expedienteIdRaw ? expedienteIdRaw : null,
    };

    this.formSubmitting = true;

    const request$ = this.modalMode === 'create'
      ? this.agendaService.createEvent(payload)
      : this.agendaService.updateEvent(this.selectedEvent!._id, payload);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.formSubmitting = false;
          this.modalOpen = false;
          this.loadEvents();
          this.loadUpcomingEvents();
        },
        error: (error) => {
          console.error('Error al guardar evento de agenda:', error);
          this.formSubmitting = false;
          this.formError = error?.error?.message || 'No fue posible guardar el evento. Inténtalo nuevamente.';
        },
      });
  }

  deleteEvent(evento: AgendaEvent): void {
    if (!evento?._id) {
      return;
    }

    this.formError = null;
    this.formSubmitting = true;

    this.agendaService
      .deleteEvent(evento._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.formSubmitting = false;
          this.selectedEvent = null;
          this.loadEvents();
          this.loadUpcomingEvents();
        },
        error: (error) => {
          console.error('Error al eliminar evento de agenda:', error);
          this.formSubmitting = false;
          this.formError = error?.error?.message || 'No fue posible eliminar el evento.';
        },
      });
  }

  onOwnerChange(ownerId: string): void {
    this.selectedOwnerId = ownerId;
    this.loadEvents();
    this.loadUpcomingEvents();
  }

  focusEvent(eventId: string): void {
    const found = this.events.find((event) => event._id === eventId);
    if (found) {
      this.selectedEvent = found;
      this.calendarOptions = {
        ...this.calendarOptions,
        initialDate: found.fechaInicio,
      };
    }
  }

  refreshSelectedEvent(): void {
    if (!this.selectedEvent) {
      return;
    }
    const updated = this.events.find((item) => item._id === this.selectedEvent?._id);
    this.selectedEvent = updated ?? null;
  }

  loadEvents(): void {
    this.isLoadingEvents = true;
    this.eventsError = null;

    this.agendaService
      .getEvents(this.currentRange, { ownerId: this.selectedOwnerId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (eventos) => {
          this.events = eventos;
          this.refreshCalendar();
          this.refreshSelectedEvent();
          this.isLoadingEvents = false;
        },
        error: (error) => {
          console.error('Error al cargar eventos de agenda:', error);
          this.events = [];
          this.refreshCalendar();
          this.eventsError = error?.error?.message || 'No fue posible cargar la agenda.';
          this.isLoadingEvents = false;
        },
      });
  }

  loadUpcomingEvents(): void {
    this.upcomingLoading = true;
    this.upcomingError = null;

    this.agendaService
      .getUpcomingEvents(5, this.selectedOwnerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (eventos) => {
          this.upcomingEvents = eventos.slice(0, 5);
          this.upcomingLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar próximos eventos:', error);
          this.upcomingEvents = [];
          this.upcomingError = error?.error?.message || 'No fue posible cargar los eventos próximos.';
          this.upcomingLoading = false;
        },
      });
  }

  fetchExpedientes(): void {
    this.expedientesLoading = true;
    this.expedientesError = null;

    this.expedientesService
      .getExpedientes({ limit: 200 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (expedientes) => {
          this.expedientes = expedientes;
          this.expedientesLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar expedientes para la agenda:', error);
          this.expedientes = [];
          this.expedientesError = 'No fue posible consultar los expedientes disponibles.';
          this.expedientesLoading = false;
        },
      });
  }

  loadUsers(): void {
    this.usersLoading = true;
    this.usersError = null;

    this.authService
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (usuarios) => {
          this.availableUsers = usuarios;
          this.usersLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar usuarios para la agenda:', error);
          this.availableUsers = [];
          this.usersError = 'No fue posible obtener la lista de usuarios.';
          this.usersLoading = false;
        },
      });
  }

  mapEventColor(tipo: AgendaEventType): string {
    switch (tipo) {
      case 'AUDIENCIA':
        return '#f03e3e';
      case 'CITA':
        return '#228be6';
      case 'REUNION':
        return '#7950f2';
      case 'TAREA':
        return '#fab005';
      default:
        return '#2b8a3e';
    }
  }

  getTipoLabel(tipo: AgendaEventType): string {
    return this.eventTypeLabels[tipo] ?? tipo;
  }

  formatEventDate(fechaIso: string, allDay: boolean): string {
    const fecha = new Date(fechaIso);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    return fecha.toLocaleDateString('es-MX', opciones);
  }

  formatEventTimeRange(evento: AgendaEvent): string {
    if (evento.allDay) {
      return 'Todo el día';
    }

    const inicio = new Date(evento.fechaInicio);
    const fin = evento.fechaFin ? new Date(evento.fechaFin) : null;
    const opciones: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    const inicioStr = inicio.toLocaleTimeString('es-MX', opciones);
    const finStr = fin ? fin.toLocaleTimeString('es-MX', opciones) : '';
    return finStr ? `${inicioStr} - ${finStr}` : inicioStr;
  }

  ownerDisplay(evento: AgendaEvent): string {
    if (evento.abogadoAsignado) {
      return evento.abogadoAsignado;
    }
    const usuario = this.availableUsers.find((user) => user._id === evento.propietario);
    return usuario ? usuario.nombre : 'Asignado';
  }

  private refreshCalendar(): void {
    const eventInputs: EventInput[] = this.events.map((evento) => ({
      id: evento._id,
      title: evento.titulo,
      start: evento.fechaInicio,
      end: evento.fechaFin ?? undefined,
      allDay: evento.allDay,
      backgroundColor: this.mapEventColor(evento.tipo),
      borderColor: this.mapEventColor(evento.tipo),
      textColor: this.mapEventTextColor(evento.tipo),
    }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events: eventInputs,
    };
  }

  private todayAsInput(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateInput(iso: string): string {
    const fecha = new Date(iso);
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatTimeInput(iso: string | undefined | null): string {
    if (!iso) {
      return '';
    }
    const fecha = new Date(iso);
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private buildIsoDate(date: string, time: string): string {
    const [year, month, day] = date.split('-').map((value) => Number(value));
    const [hour, minute] = time.split(':').map((value) => Number(value));
    const localDate = new Date(year, month - 1, day, hour, minute, 0, 0);
    return localDate.toISOString();
  }

  mapEventTextColor(tipo: AgendaEventType): string {
    if (tipo === 'TAREA' || tipo === 'OTRO') {
      return '#212529';
    }
    return '#fff';
  }

  private handleAllDayToggle(allDay: boolean): void {
    const horaInicioControl = this.eventForm.get('horaInicio');
    const horaFinControl = this.eventForm.get('horaFin');

    if (!horaInicioControl || !horaFinControl) {
      return;
    }

    if (allDay) {
      horaInicioControl.clearValidators();
      horaInicioControl.setValue('', { emitEvent: false });
      horaFinControl.clearValidators();
      horaFinControl.setValue('', { emitEvent: false });
    } else {
      horaInicioControl.setValidators([Validators.required]);
    }

    horaInicioControl.updateValueAndValidity({ emitEvent: false });
    horaFinControl.updateValueAndValidity({ emitEvent: false });
  }

  trackByEventId(_index: number, evento: AgendaEvent): string {
    return evento._id;
  }
}
