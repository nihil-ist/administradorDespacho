export interface AuthUser {
  _id: string;
  usuario: string;
  correo: string;
  tipo: string;
  nombre: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}
