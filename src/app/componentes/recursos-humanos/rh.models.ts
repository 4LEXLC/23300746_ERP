// Tipos de datos compartidos por recursos humanos.
export interface PagoNomina {
  trabajador: string;
  puesto: string;
  periodo: string;
  monto: number;
  fechaPago: string;
  estado: 'pagado' | 'pendiente';
}

export interface Trabajador {
  id_trabajador?: number;
  id_usuario?: number | null;
  id_puesto?: number;
  nombre: string;
  telefono?: string;
  correo: string;
  puesto: string;
  salario: number;
  fechaContratacion?: string;
  dias?: string;
  horaEntrada?: string;
  horaSalida?: string;
  horario: string;
  estado: 'activo' | 'baja';
}

export interface Asistencia {
  id_asistencia?: number;
  id_trabajador?: number;
  nombre: string;
  detalle: string;
  estado: 'a-tiempo' | 'retardo' | 'falta' | 'extra';
}

export interface Permiso {
  id_permiso?: number;
  id_trabajador?: number;
  nombre: string;
  tipo: string;
  fechas: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
}

// Forma las iniciales con las primeras dos palabras del nombre.
export function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export interface DatosTrabajador {
  nombre: string;
  telefono: string;
  correo: string;
  puesto: string;
  salario: number;
  fechaContratacion: string;
  dias: string;
  horaEntrada: string;
  horaSalida: string;
}
