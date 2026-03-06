import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, parseISO, isToday, isBefore, isAfter, differenceInHours } from 'date-fns'
import { es } from 'date-fns/locale'

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr, { locale: es })
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "EEEE d 'de' MMMM", { locale: es })
}

export function formatTime(time: string): string {
  return time
}

export function getDayName(date: Date): string {
  return format(date, 'EEEE', { locale: es })
}

export function getDayNameCapitalized(date: Date): string {
  const name = getDayName(date)
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function nextWeek(date: Date): Date {
  return addWeeks(date, 1)
}

export function prevWeek(date: Date): Date {
  return subWeeks(date, 1)
}

export function isTodayDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isToday(d)
}

export function isPastDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isBefore(d, new Date()) && !isToday(d)
}

export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isAfter(d, new Date())
}

export function getHoursUntil(dateStr: string, timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const appointmentDate = parseISO(dateStr)
  appointmentDate.setHours(hours, minutes, 0, 0)
  return differenceInHours(appointmentDate, new Date())
}

export function generateTimeSlots(startTime: string, endTime: string, durationMinutes: number): string[] {
  const slots: string[] = []
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  
  let currentMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM
  
  while (currentMinutes + durationMinutes <= endMinutes) {
    const h = Math.floor(currentMinutes / 60)
    const m = currentMinutes % 60
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    currentMinutes += durationMinutes
  }
  
  return slots
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function isTimeInRange(time: string, start: string, end: string): boolean {
  const t = timeToMinutes(time)
  const s = timeToMinutes(start)
  const e = timeToMinutes(end)
  return t >= s && t < e
}

export function doTimesOverlap(
  start1: string,
  duration1: number,
  start2: string,
  duration2: number
): boolean {
  const s1 = timeToMinutes(start1)
  const e1 = s1 + duration1
  const s2 = timeToMinutes(start2)
  const e2 = s2 + duration2
  
  return s1 < e2 && s2 < e1
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 })
  }
}
