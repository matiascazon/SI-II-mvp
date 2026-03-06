// Types for Consultorio de Kinesiología Inti Huara

export interface Kinesiologo {
  dni: string
  nombre: string
  apellido: string
  telefono: string
  email: string
  especialidades: string[]
  obrasSociales: string[] // RNOS codes
  activo: boolean
}

export interface Horario {
  dniKinesiologo: string
  disponibilidad: DisponibilidadDia[]
}

export interface DisponibilidadDia {
  dia: string
  horaInicio: string
  horaFin: string
}

export interface ObraSocial {
  rnos: string
  nombre: string
  sigla: string
  telefono: string
  email: string
}

export interface Tratamiento {
  nombre: string
  descripcion: string
  precioPorSesion: number
  duracionMinutos: number
}

export interface Paciente {
  dni: string
  nombre: string
  apellido: string
  telefono: string
  fechaNacimiento: string
  obraSocialRnos: string | null
  numeroAfiliado: string | null
}

export type EstadoTurno = 'pendiente' | 'confirmado' | 'cancelado'

export interface Turno {
  id: string
  dniPaciente: string
  dniKinesiologo: string
  tratamiento: string
  fecha: string // YYYY-MM-DD
  hora: string // HH:mm
  motivoConsulta: string
  ordenMedica: string | null
  estado: EstadoTurno
  esParticular: boolean
  createdAt: string
}

export interface Cobro {
  id: string
  turnoId: string
  monto: number
  coseguro: number
  fecha: string
  reembolso: number | null
  estado: 'cobrado' | 'reembolsado'
}

export interface ClinicData {
  kinesiólogos: Kinesiologo[]
  horarios: Horario[]
  obrasSociales: ObraSocial[]
  tratamientos: Tratamiento[]
  pacientes: Paciente[]
  turnos: Turno[]
  cobros: Cobro[]
}

// Form validation types
export interface FieldError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: FieldError[]
}
