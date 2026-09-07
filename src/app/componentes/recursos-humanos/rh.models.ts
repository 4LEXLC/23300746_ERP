export interface PagoNomina {
  trabajador: string;
  puesto: string;
  periodo: string;
  monto: number;
  fechaPago: string;
  estado: 'pagado' | 'pendiente';
}

export interface Trabajador {
  nombre: string;
  correo: string;
  puesto: string;
  salario: number;
  horario: string;
  estado: 'activo' | 'baja';
}

export interface Asistencia {
  nombre: string;
  detalle: string;
  estado: 'a-tiempo' | 'retardo' | 'falta' | 'extra';
}

export interface Permiso {
  nombre: string;
  tipo: string;
  fechas: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
}

export function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
