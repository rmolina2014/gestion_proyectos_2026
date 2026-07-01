export type UserRole = 'Administrador' | 'Analista' | 'Programador';
export type UserStatus = 'Activo' | 'Inactivo';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  contrasena: string;
  rol: UserRole;
  estado: UserStatus;
  avatar: string; // Hex color or class name
}

export type ProjectStatus = 'Pendiente' | 'Activo' | 'Suspendido' | 'Finalizado';
export type Priority = 'Baja' | 'Media' | 'Alta';

export interface Project {
  id: string;
  nombre: string;
  cliente: string;
  descripcion: string;
  fechaInicio: string;
  fechaEstimada: string;
  estado: ProjectStatus;
  responsableId: string; // User ID
  prioridad: Priority;
}

export type ReqStatus = 'Nuevo' | 'En análisis' | 'Aprobado' | 'En desarrollo' | 'Terminado';

export interface Requirement {
  id: string; // e.g., REQ-001
  codigo: string; // Human-friendly identifier
  proyectoId: string;
  titulo: string;
  descripcion: string;
  prioridad: Priority;
  estado: ReqStatus;
  analistaId: string; // User ID
  fechaCreacion: string;
  fechaActualizacion: string;
}

export type TaskType = 'Desarrollo' | 'Testing' | 'Mantenimiento' | 'Investigación' | 'Documentación';
export type TaskStatus = 'Pendiente' | 'En desarrollo' | 'En Testing' | 'Error' | 'Terminada';

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  titulo: string;
  descripcion: string;
  proyectoId: string;
  requerimientoId: string;
  tipo: TaskType;
  responsableId: string; // User ID
  prioridad: Priority;
  horasEstimadas: number;
  estado: TaskStatus;
  comentarios: Comment[];
  fechaCreacion: string;
}

export interface AppState {
  users: User[];
  projects: Project[];
  requirements: Requirement[];
  tasks: Task[];
  currentUser: User | null;
}
