export type AgendaEventType = 'AUDIENCIA' | 'CITA' | 'REUNION' | 'TAREA' | 'OTRO';

export interface AgendaEvent {
  _id: string;
  titulo: string;
  descripcion?: string | null;
  fechaInicio: string;
  fechaFin?: string | null;
  allDay: boolean;
  tipo: AgendaEventType;
  ubicacion?: string | null;
  expediente?: {
    _id: string;
    titulo: string;
    numeroControl: string;
    abogadoAsignado?: string;
    fechaAudiencia?: string | null;
  } | null;
  propietario: string;
  abogadoAsignado?: string | null;
  creadoPor?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgendaEventPayload {
  titulo: string;
  fechaInicio: string;
  fechaFin?: string | null;
  allDay?: boolean;
  descripcion?: string | null;
  ubicacion?: string | null;
  tipo?: AgendaEventType;
  expedienteId?: string | null;
}

export type AgendaEventUpdatePayload = Partial<AgendaEventPayload>;
