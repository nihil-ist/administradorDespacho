import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Expediente, ExpedienteFilters, ExpedientePayload } from '../app/models/expediente.model';
import { AuthService } from './auth.service';

interface ExpedienteResponse {
  message: string;
  expediente: Expediente;
}

interface ExpedienteStatsResponse {
  total: number;
  porEstado: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class ExpedientesService {
  private readonly baseUrl = `${environment.apiBaseUrl}/expedientes`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getExpedientes(filters: ExpedienteFilters = {}): Observable<Expediente[]> {
    let params = new HttpParams();

    if (filters.status && filters.status !== 'TODOS') {
      params = params.set('status', filters.status);
    }

    if (filters.search) {
      params = params.set('search', filters.search.trim());
    }

    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    params = this.applyRoleFilter(params);

    return this.http.get<Expediente[]>(this.baseUrl, { params });
  }

  getExpediente(id: string): Observable<Expediente> {
    return this.http.get<Expediente>(`${this.baseUrl}/${id}`);
  }

  getStats(): Observable<ExpedienteStatsResponse> {
    let params = new HttpParams();
    params = this.applyRoleFilter(params);
    return this.http.get<ExpedienteStatsResponse>(`${this.baseUrl}/stats`, { params });
  }

  createExpediente(payload: ExpedientePayload): Observable<ExpedienteResponse> {
    const currentUser = this.authService.getCurrentUser();
    const assigned = this.authService.getAssignmentIdentifier();

    const payloadWithMeta: ExpedientePayload = {
      ...payload,
      abogadoAsignado: this.authService.isAdmin()
        ? payload.abogadoAsignado
        : assigned || payload.abogadoAsignado,
      creadoPor: payload.creadoPor ?? currentUser?._id ?? null,
    };

    return this.http.post<ExpedienteResponse>(this.baseUrl, payloadWithMeta);
  }

  updateExpediente(id: string, payload: Partial<ExpedientePayload>): Observable<ExpedienteResponse> {
    const data: Partial<ExpedientePayload> = { ...payload };

    if (!this.authService.isAdmin()) {
      const assigned = this.authService.getAssignmentIdentifier();
      if (assigned) {
        data.abogadoAsignado = assigned;
      }
    }

    return this.http.patch<ExpedienteResponse>(`${this.baseUrl}/${id}`, data);
  }

  deleteExpediente(id: string): Observable<ExpedienteResponse> {
    return this.http.delete<ExpedienteResponse>(`${this.baseUrl}/${id}`);
  }

  private applyRoleFilter(params: HttpParams): HttpParams {
    if (this.authService.isAdmin()) {
      return params;
    }

    const assigned = this.authService.getAssignmentIdentifier();
    if (assigned) {
      return params.set('assignedTo', assigned);
    }

    return params;
  }
}
