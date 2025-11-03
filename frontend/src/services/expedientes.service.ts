import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Expediente, ExpedienteFilters, ExpedientePayload } from '../app/models/expediente.model';

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

  constructor(private http: HttpClient) {}

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

    return this.http.get<Expediente[]>(this.baseUrl, { params });
  }

  getExpediente(id: string): Observable<Expediente> {
    return this.http.get<Expediente>(`${this.baseUrl}/${id}`);
  }

  getStats(): Observable<ExpedienteStatsResponse> {
    return this.http.get<ExpedienteStatsResponse>(`${this.baseUrl}/stats`);
  }

  createExpediente(payload: ExpedientePayload): Observable<ExpedienteResponse> {
    return this.http.post<ExpedienteResponse>(this.baseUrl, payload);
  }

  updateExpediente(id: string, payload: Partial<ExpedientePayload>): Observable<ExpedienteResponse> {
    return this.http.patch<ExpedienteResponse>(`${this.baseUrl}/${id}`, payload);
  }

  deleteExpediente(id: string): Observable<ExpedienteResponse> {
    return this.http.delete<ExpedienteResponse>(`${this.baseUrl}/${id}`);
  }
}
