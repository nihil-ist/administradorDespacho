import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import {
  AgendaEvent,
  AgendaEventPayload,
  AgendaEventType,
  AgendaEventUpdatePayload,
} from '../app/models/agenda-event.model';
import { AuthUser } from '../app/models/user.model';

export const AGENDA_EVENT_TYPES: AgendaEventType[] = ['AUDIENCIA', 'CITA', 'REUNION', 'TAREA', 'OTRO'];

interface AgendaEventResponse {
  message: string;
  evento: AgendaEvent;
}

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly baseUrl = `${environment.apiBaseUrl}/agenda`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getEvents(
    range: { start?: string; end?: string } = {},
    options: { ownerId?: string; tipo?: AgendaEventType | 'ALL'; limit?: number; expedienteId?: string } = {}
  ): Observable<AgendaEvent[]> {
    let params = new HttpParams();

    if (range.start) {
      params = params.set('from', range.start);
    }

    if (range.end) {
      params = params.set('to', range.end);
    }

    if (options.tipo && options.tipo !== 'ALL') {
      params = params.set('tipo', options.tipo);
    }

    if (options.limit) {
      params = params.set('limit', options.limit.toString());
    }

    if (options.expedienteId) {
      params = params.set('expedienteId', options.expedienteId);
    }

    const currentUser = this.authService.getCurrentUser();

    if (this.authService.isAdmin()) {
      if (options.ownerId && options.ownerId !== 'ALL') {
        params = params.set('ownerId', options.ownerId);
      }
    } else if (currentUser) {
      params = params.set('ownerId', currentUser._id);
    }

    return this.http.get<AgendaEvent[]>(this.baseUrl, { params });
  }

  getUpcomingEvents(limit = 5, ownerId?: string): Observable<AgendaEvent[]> {
    let params = new HttpParams().set('upcoming', 'true');

    if (limit) {
      params = params.set('limit', limit.toString());
    }

    const currentUser = this.authService.getCurrentUser();

    if (this.authService.isAdmin()) {
      if (ownerId && ownerId !== 'ALL') {
        params = params.set('ownerId', ownerId);
      }
    } else if (currentUser) {
      params = params.set('ownerId', currentUser._id);
    }

    return this.http.get<AgendaEvent[]>(this.baseUrl, { params });
  }

  createEvent(payload: AgendaEventPayload): Observable<AgendaEvent> {
    const currentUser = this.requireCurrentUser();

    const body: Record<string, unknown> = {
      ...payload,
      propietario: currentUser._id,
      creadoPor: currentUser._id,
      abogadoAsignado: this.authService.getAssignmentIdentifier(),
    };

    if (!payload.expedienteId) {
      delete body['expedienteId'];
    }

    return this.http
      .post<AgendaEventResponse>(this.baseUrl, body)
      .pipe(map((response) => response.evento));
  }

  updateEvent(id: string, payload: AgendaEventUpdatePayload): Observable<AgendaEvent> {
    const body: Record<string, unknown> = {};

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) {
        body[key] = value;
      }
    });

    if (payload.expedienteId === undefined) {
      delete body['expedienteId'];
    }

    return this.http
      .patch<AgendaEventResponse>(`${this.baseUrl}/${id}`, body)
      .pipe(map((response) => response.evento));
  }

  deleteEvent(id: string): Observable<AgendaEvent> {
    return this.http
      .delete<AgendaEventResponse>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.evento));
  }

  getEventTypes(): AgendaEventType[] {
    return [...AGENDA_EVENT_TYPES];
  }

  private requireCurrentUser(): AuthUser {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('No hay un usuario autenticado en la sesión actual');
    }
    return user;
  }
}
