export type ExpedienteEstado = 'EXHORTO' | 'EN_PROCESO' | 'TERMINADO' | 'ARCHIVADO';

export interface ExpedienteArchivo {
  nombreOriginal: string;
  url: string;
  storagePath: string;
  contentType?: string | null;
  size?: number | null;
}

export interface Expediente {
  _id: string;
  titulo: string;
  numeroControl: string;
  cliente: string;
  abogadoAsignado: string;
  tipo: string;
  estatus: ExpedienteEstado;
  fechaApertura: string;
  fechaAudiencia?: string | null;
  fechaConclusion?: string | null;
  descripcion?: string | null;
  notasInternas?: string | null;
  etiquetas?: string[];
  archivos: ExpedienteArchivo[];
  creadoPor?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpedientePayload {
  titulo: string;
  numeroControl: string;
  cliente: string;
  abogadoAsignado: string;
  tipo: string;
  estatus?: ExpedienteEstado;
  fechaApertura: string;
  fechaAudiencia?: string | null;
  fechaConclusion?: string | null;
  descripcion?: string | null;
  notasInternas?: string | null;
  etiquetas?: string[];
  archivos?: ExpedienteArchivo[];
  creadoPor?: string | null;
}

export interface ExpedienteFilters {
  status?: ExpedienteEstado | 'TODOS';
  search?: string;
  limit?: number;
}
