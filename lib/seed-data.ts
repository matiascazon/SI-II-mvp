import type { ClinicData } from './types'

export const seedData: ClinicData = {
  "kinesiólogos": [
    {
      "dni": "25000001",
      "nombre": "Carlos",
      "apellido": "Méndez",
      "telefono": "3884001122",
      "email": "cmendez@intihura.com",
      "especialidades": ["Neurorrehabilitación", "Movimiento Eficiente"],
      "obrasSociales": ["010001", "010002"],
      "activo": true
    },
    {
      "dni": "28000002",
      "nombre": "Laura",
      "apellido": "Quispe",
      "telefono": "3884003344",
      "email": "lquispe@intihura.com",
      "especialidades": ["Osteopatía", "Calor-Frío", "Gerontokinesiología"],
      "obrasSociales": ["010003", "010004"],
      "activo": true
    }
  ],
  "horarios": [
    {
      "dniKinesiologo": "25000001",
      "disponibilidad": [
        { "dia": "Lunes", "horaInicio": "08:00", "horaFin": "13:00" },
        { "dia": "Miércoles", "horaInicio": "08:00", "horaFin": "13:00" },
        { "dia": "Viernes", "horaInicio": "14:00", "horaFin": "19:00" }
      ]
    },
    {
      "dniKinesiologo": "28000002",
      "disponibilidad": [
        { "dia": "Martes", "horaInicio": "09:00", "horaFin": "14:00" },
        { "dia": "Jueves", "horaInicio": "09:00", "horaFin": "14:00" },
        { "dia": "Sábado", "horaInicio": "08:00", "horaFin": "12:00" }
      ]
    }
  ],
  "obrasSociales": [
    { "rnos": "010001", "nombre": "OSDE", "sigla": "OSDE", "telefono": "0800-555-6733", "email": "contacto@osde.com.ar" },
    { "rnos": "010002", "nombre": "PAMI", "sigla": "PAMI", "telefono": "138", "email": "contacto@pami.org.ar" },
    { "rnos": "010003", "nombre": "IOMA", "sigla": "IOMA", "telefono": "0800-222-4662", "email": "info@ioma.gba.gov.ar" },
    { "rnos": "010004", "nombre": "Swiss Medical", "sigla": "SMG", "telefono": "0810-888-7646", "email": "info@swissmedical.com.ar" }
  ],
  "tratamientos": [
    { "nombre": "Neurorrehabilitación", "descripcion": "Evaluación y tratamiento de pacientes con lesiones del sistema nervioso", "precioPorSesion": 15000, "duracionMinutos": 60 },
    { "nombre": "Osteopatía", "descripcion": "Diagnóstico y tratamiento de trastornos musculoesqueléticos", "precioPorSesion": 12000, "duracionMinutos": 45 },
    { "nombre": "Movimiento Eficiente", "descripcion": "Optimización de biomecánica y funcionalidad corporal", "precioPorSesion": 10000, "duracionMinutos": 45 },
    { "nombre": "Calor-Frío", "descripcion": "Tratamiento con calor y frío para alivio del dolor", "precioPorSesion": 8000, "duracionMinutos": 30 },
    { "nombre": "Gerontokinesiología", "descripcion": "Atención especializada para personas mayores", "precioPorSesion": 10000, "duracionMinutos": 60 },
    { "nombre": "Entrevista inicial", "descripcion": "Primera consulta de evaluación", "precioPorSesion": 20000, "duracionMinutos": 60 }
  ],
  "pacientes": [
    { "dni": "30000001", "nombre": "Ana", "apellido": "Flores", "telefono": "3884111222", "fechaNacimiento": "1985-03-12", "obraSocialRnos": "010001", "numeroAfiliado": "A-123456" },
    { "dni": "33000002", "nombre": "Roberto", "apellido": "Mamani", "telefono": "3884333444", "fechaNacimiento": "1972-07-28", "obraSocialRnos": null, "numeroAfiliado": null }
  ],
  "turnos": [],
  "cobros": []
}
