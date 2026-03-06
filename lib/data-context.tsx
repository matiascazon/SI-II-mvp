'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { ClinicData, Kinesiologo, Paciente, Turno, Cobro, ObraSocial, Tratamiento, Horario } from './types'
import { seedData } from './seed-data'
import * as storage from './storage'

interface DataContextType {
  data: ClinicData
  isLoading: boolean
  // Kinesiólogos
  kinesiologos: Kinesiologo[]
  activeKinesiologos: Kinesiologo[]
  getKinesiologoByDni: (dni: string) => Kinesiologo | undefined
  saveKinesiologo: (k: Kinesiologo) => void
  deleteKinesiologo: (dni: string) => void
  // Horarios
  horarios: Horario[]
  getHorarioByKinesiologo: (dni: string) => Horario | undefined
  saveHorario: (h: Horario) => void
  // Pacientes
  pacientes: Paciente[]
  getPacienteByDni: (dni: string) => Paciente | undefined
  searchPacientesByDni: (dni: string) => Paciente[]
  savePaciente: (p: Paciente) => void
  deletePaciente: (dni: string) => void
  // Turnos
  turnos: Turno[]
  getTurnoById: (id: string) => Turno | undefined
  getTurnosByDate: (fecha: string) => Turno[]
  getTurnosByKinesiologo: (dni: string) => Turno[]
  getTurnosByPaciente: (dni: string) => Turno[]
  saveTurno: (t: Turno) => void
  deleteTurno: (id: string) => void
  // Cobros
  cobros: Cobro[]
  getCobrosByDate: (fecha: string) => Cobro[]
  getCobroByTurnoId: (turnoId: string) => Cobro | undefined
  saveCobro: (c: Cobro) => void
  // Obras Sociales
  obrasSociales: ObraSocial[]
  getObraSocialByRnos: (rnos: string) => ObraSocial | undefined
  saveObraSocial: (o: ObraSocial) => void
  deleteObraSocial: (rnos: string) => void
  // Tratamientos
  tratamientos: Tratamiento[]
  getTratamientoByNombre: (nombre: string) => Tratamiento | undefined
  saveTratamiento: (t: Tratamiento) => void
  deleteTratamiento: (nombre: string) => void
  // Utils
  resetData: () => void
  refreshData: () => void
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ClinicData>(seedData)
  const [isLoading, setIsLoading] = useState(true)

  const refreshData = useCallback(() => {
    const newData = storage.getData()
    setData(newData)
  }, [])

  useEffect(() => {
    const loaded = storage.initializeData()
    setData(loaded)
    setIsLoading(false)
  }, [])

  // Kinesiólogos
  const saveKinesiologo = useCallback((k: Kinesiologo) => {
    storage.saveKinesiologo(k)
    refreshData()
  }, [refreshData])

  const deleteKinesiologo = useCallback((dni: string) => {
    storage.deleteKinesiologo(dni)
    refreshData()
  }, [refreshData])

  // Horarios
  const saveHorario = useCallback((h: Horario) => {
    storage.saveHorario(h)
    refreshData()
  }, [refreshData])

  // Pacientes
  const savePaciente = useCallback((p: Paciente) => {
    storage.savePaciente(p)
    refreshData()
  }, [refreshData])

  const deletePaciente = useCallback((dni: string) => {
    storage.deletePaciente(dni)
    refreshData()
  }, [refreshData])

  // Turnos
  const saveTurno = useCallback((t: Turno) => {
    storage.saveTurno(t)
    refreshData()
  }, [refreshData])

  const deleteTurno = useCallback((id: string) => {
    storage.deleteTurno(id)
    refreshData()
  }, [refreshData])

  // Cobros
  const saveCobro = useCallback((c: Cobro) => {
    storage.saveCobro(c)
    refreshData()
  }, [refreshData])

  // Obras Sociales
  const saveObraSocial = useCallback((o: ObraSocial) => {
    storage.saveObraSocial(o)
    refreshData()
  }, [refreshData])

  const deleteObraSocial = useCallback((rnos: string) => {
    storage.deleteObraSocial(rnos)
    refreshData()
  }, [refreshData])

  // Tratamientos
  const saveTratamiento = useCallback((t: Tratamiento) => {
    storage.saveTratamiento(t)
    refreshData()
  }, [refreshData])

  const deleteTratamiento = useCallback((nombre: string) => {
    storage.deleteTratamiento(nombre)
    refreshData()
  }, [refreshData])

  // Reset
  const resetData = useCallback(() => {
    storage.resetData()
    refreshData()
  }, [refreshData])

  const value: DataContextType = {
    data,
    isLoading,
    // Kinesiólogos
    kinesiologos: data.kinesiólogos,
    activeKinesiologos: data.kinesiólogos.filter(k => k.activo),
    getKinesiologoByDni: (dni) => data.kinesiólogos.find(k => k.dni === dni),
    saveKinesiologo,
    deleteKinesiologo,
    // Horarios
    horarios: data.horarios,
    getHorarioByKinesiologo: (dni) => data.horarios.find(h => h.dniKinesiologo === dni),
    saveHorario,
    // Pacientes
    pacientes: data.pacientes,
    getPacienteByDni: (dni) => data.pacientes.find(p => p.dni === dni),
    searchPacientesByDni: (dni) => data.pacientes.filter(p => p.dni.includes(dni)),
    savePaciente,
    deletePaciente,
    // Turnos
    turnos: data.turnos,
    getTurnoById: (id) => data.turnos.find(t => t.id === id),
    getTurnosByDate: (fecha) => data.turnos.filter(t => t.fecha === fecha),
    getTurnosByKinesiologo: (dni) => data.turnos.filter(t => t.dniKinesiologo === dni),
    getTurnosByPaciente: (dni) => data.turnos.filter(t => t.dniPaciente === dni),
    saveTurno,
    deleteTurno,
    // Cobros
    cobros: data.cobros,
    getCobrosByDate: (fecha) => data.cobros.filter(c => c.fecha === fecha),
    getCobroByTurnoId: (turnoId) => data.cobros.find(c => c.turnoId === turnoId),
    saveCobro,
    // Obras Sociales
    obrasSociales: data.obrasSociales,
    getObraSocialByRnos: (rnos) => data.obrasSociales.find(o => o.rnos === rnos),
    saveObraSocial,
    deleteObraSocial,
    // Tratamientos
    tratamientos: data.tratamientos,
    getTratamientoByNombre: (nombre) => data.tratamientos.find(t => t.nombre === nombre),
    saveTratamiento,
    deleteTratamiento,
    // Utils
    resetData,
    refreshData,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
