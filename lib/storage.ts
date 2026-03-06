'use client'

import type { ClinicData, Kinesiologo, Paciente, Turno, Cobro, ObraSocial, Tratamiento, Horario } from './types'
import { seedData } from './seed-data'

const STORAGE_KEY = 'inti-huara-clinic-data'

export function initializeData(): ClinicData {
  if (typeof window === 'undefined') return seedData
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData))
    return seedData
  }
  
  try {
    return JSON.parse(stored) as ClinicData
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData))
    return seedData
  }
}

export function getData(): ClinicData {
  if (typeof window === 'undefined') return seedData
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return initializeData()
  
  try {
    return JSON.parse(stored) as ClinicData
  } catch {
    return initializeData()
  }
}

export function saveData(data: ClinicData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetData(): ClinicData {
  if (typeof window === 'undefined') return seedData
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData))
  return seedData
}

// Kinesiólogos
export function getKinesiologos(): Kinesiologo[] {
  return getData().kinesiólogos
}

export function getActiveKinesiologos(): Kinesiologo[] {
  return getData().kinesiólogos.filter(k => k.activo)
}

export function getKinesiologoByDni(dni: string): Kinesiologo | undefined {
  return getData().kinesiólogos.find(k => k.dni === dni)
}

export function saveKinesiologo(kinesiologo: Kinesiologo): void {
  const data = getData()
  const index = data.kinesiólogos.findIndex(k => k.dni === kinesiologo.dni)
  if (index >= 0) {
    data.kinesiólogos[index] = kinesiologo
  } else {
    data.kinesiólogos.push(kinesiologo)
  }
  saveData(data)
}

export function deleteKinesiologo(dni: string): void {
  const data = getData()
  data.kinesiólogos = data.kinesiólogos.filter(k => k.dni !== dni)
  data.horarios = data.horarios.filter(h => h.dniKinesiologo !== dni)
  saveData(data)
}

// Horarios
export function getHorarios(): Horario[] {
  return getData().horarios
}

export function getHorarioByKinesiologo(dniKinesiologo: string): Horario | undefined {
  return getData().horarios.find(h => h.dniKinesiologo === dniKinesiologo)
}

export function saveHorario(horario: Horario): void {
  const data = getData()
  const index = data.horarios.findIndex(h => h.dniKinesiologo === horario.dniKinesiologo)
  if (index >= 0) {
    data.horarios[index] = horario
  } else {
    data.horarios.push(horario)
  }
  saveData(data)
}

// Pacientes
export function getPacientes(): Paciente[] {
  return getData().pacientes
}

export function getPacienteByDni(dni: string): Paciente | undefined {
  return getData().pacientes.find(p => p.dni === dni)
}

export function searchPacientesByDni(dni: string): Paciente[] {
  return getData().pacientes.filter(p => p.dni.includes(dni))
}

export function savePaciente(paciente: Paciente): void {
  const data = getData()
  const index = data.pacientes.findIndex(p => p.dni === paciente.dni)
  if (index >= 0) {
    data.pacientes[index] = paciente
  } else {
    data.pacientes.push(paciente)
  }
  saveData(data)
}

export function deletePaciente(dni: string): void {
  const data = getData()
  data.pacientes = data.pacientes.filter(p => p.dni !== dni)
  saveData(data)
}

// Turnos
export function getTurnos(): Turno[] {
  return getData().turnos
}

export function getTurnoById(id: string): Turno | undefined {
  return getData().turnos.find(t => t.id === id)
}

export function getTurnosByDate(fecha: string): Turno[] {
  return getData().turnos.filter(t => t.fecha === fecha)
}

export function getTurnosByKinesiologo(dni: string): Turno[] {
  return getData().turnos.filter(t => t.dniKinesiologo === dni)
}

export function getTurnosByPaciente(dni: string): Turno[] {
  return getData().turnos.filter(t => t.dniPaciente === dni)
}

export function saveTurno(turno: Turno): void {
  const data = getData()
  const index = data.turnos.findIndex(t => t.id === turno.id)
  if (index >= 0) {
    data.turnos[index] = turno
  } else {
    data.turnos.push(turno)
  }
  saveData(data)
}

export function deleteTurno(id: string): void {
  const data = getData()
  data.turnos = data.turnos.filter(t => t.id !== id)
  saveData(data)
}

// Cobros
export function getCobros(): Cobro[] {
  return getData().cobros
}

export function getCobrosByDate(fecha: string): Cobro[] {
  return getData().cobros.filter(c => c.fecha === fecha)
}

export function getCobroByTurnoId(turnoId: string): Cobro | undefined {
  return getData().cobros.find(c => c.turnoId === turnoId)
}

export function saveCobro(cobro: Cobro): void {
  const data = getData()
  const index = data.cobros.findIndex(c => c.id === cobro.id)
  if (index >= 0) {
    data.cobros[index] = cobro
  } else {
    data.cobros.push(cobro)
  }
  saveData(data)
}

// Obras Sociales
export function getObrasSociales(): ObraSocial[] {
  return getData().obrasSociales
}

export function getObraSocialByRnos(rnos: string): ObraSocial | undefined {
  return getData().obrasSociales.find(o => o.rnos === rnos)
}

export function saveObraSocial(obraSocial: ObraSocial): void {
  const data = getData()
  const index = data.obrasSociales.findIndex(o => o.rnos === obraSocial.rnos)
  if (index >= 0) {
    data.obrasSociales[index] = obraSocial
  } else {
    data.obrasSociales.push(obraSocial)
  }
  saveData(data)
}

export function deleteObraSocial(rnos: string): void {
  const data = getData()
  data.obrasSociales = data.obrasSociales.filter(o => o.rnos !== rnos)
  saveData(data)
}

// Tratamientos
export function getTratamientos(): Tratamiento[] {
  return getData().tratamientos
}

export function getTratamientoByNombre(nombre: string): Tratamiento | undefined {
  return getData().tratamientos.find(t => t.nombre === nombre)
}

export function saveTratamiento(tratamiento: Tratamiento): void {
  const data = getData()
  const index = data.tratamientos.findIndex(t => t.nombre === tratamiento.nombre)
  if (index >= 0) {
    data.tratamientos[index] = tratamiento
  } else {
    data.tratamientos.push(tratamiento)
  }
  saveData(data)
}

export function deleteTratamiento(nombre: string): void {
  const data = getData()
  data.tratamientos = data.tratamientos.filter(t => t.nombre !== nombre)
  saveData(data)
}

// Helper function to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
