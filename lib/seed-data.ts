import type { ClinicData } from './types'

export const seedData: ClinicData = {
  "kinesiólogos": [
    {
      "dni": "25000001",
      "nombre": "Marcelo",
      "apellido": "Vacaflor",
      "telefono": "3884001122",
      "email": "mvacaflor@intihura.com",
      "especialidades": ["Neurorrehabilitación", "Movimiento Eficiente"],
      "obrasSociales": ["010001", "010002"],
      "activo": true
    },
    {
      "dni": "28000002",
      "nombre": "Andrea",
      "apellido": "Orellana",
      "telefono": "3884003344",
      "email": "aorellana@intihura.com",
      "especialidades": ["Osteopatía", "Calor-Frío", "Gerontokinesiología"],
      "obrasSociales": ["010003", "010004"],
      "activo": true
    },
    {
      "dni": "30000003",
      "nombre": "Julieta",
      "apellido": "Sánchez",
      "telefono": "3884005566",
      "email": "jsanchez@intihura.com",
      "especialidades": ["Kinesiología Deportiva", "RPG"],
      "obrasSociales": ["010001", "010003"],
      "activo": true
    },
    {
      "dni": "32000004",
      "nombre": "Leticia",
      "apellido": "Gómez",
      "telefono": "3884007788",
      "email": "lgomez@intihura.com",
      "especialidades": ["Drenaje Linfático", "Kinesiología Dermatofuncional"],
      "obrasSociales": ["010002", "010004"],
      "activo": true
    },
    {
      "dni": "35000005",
      "nombre": "Fernando",
      "apellido": "Ríos",
      "telefono": "3884009900",
      "email": "frios@intihura.com",
      "especialidades": ["Traumatología", "Fisioterapia"],
      "obrasSociales": ["010001", "010004"],
      "activo": true
    },
    {
      "dni": "38000006",
      "nombre": "Sandra",
      "apellido": "Paz",
      "telefono": "3884112233",
      "email": "spaz@intihura.com",
      "especialidades": ["Estimulación Temprana"],
      "obrasSociales": ["010002", "010003"],
      "activo": true
    },
    {
      "dni": "40000007",
      "nombre": "Ricardo",
      "apellido": "Mena",
      "telefono": "3884223344",
      "email": "rmena@intihura.com",
      "especialidades": ["Rehabilitación Respiratoria"],
      "obrasSociales": ["010001", "010002"],
      "activo": true
    },
    {
      "dni": "42000008",
      "nombre": "Valeria",
      "apellido": "Torres",
      "telefono": "3884334455",
      "email": "vtorres@intihura.com",
      "especialidades": [],
      "obrasSociales": ["010003", "010004"],
      "activo": true
    }
  ],
  "horarios": [
    {
      "dniKinesiologo": "25000001",
      "disponibilidad": [
        { "dia": "Lunes", "horaInicio": "08:00", "horaFin": "14:00" },
        { "dia": "Martes", "horaInicio": "08:00", "horaFin": "14:00" },
        { "dia": "Miércoles", "horaInicio": "08:00", "horaFin": "14:00" },
        { "dia": "Jueves", "horaInicio": "08:00", "horaFin": "14:00" },
        { "dia": "Viernes", "horaInicio": "08:00", "horaFin": "14:00" }
      ]
    },
    {
      "dniKinesiologo": "28000002",
      "disponibilidad": [
        { "dia": "Lunes", "horaInicio": "14:00", "horaFin": "20:00" },
        { "dia": "Martes", "horaInicio": "14:00", "horaFin": "20:00" },
        { "dia": "Miércoles", "horaInicio": "14:00", "horaFin": "20:00" },
        { "dia": "Jueves", "horaInicio": "14:00", "horaFin": "20:00" },
        { "dia": "Viernes", "horaInicio": "14:00", "horaFin": "20:00" }
      ]
    },
    {
      "dniKinesiologo": "30000003",
      "disponibilidad": [
        { "dia": "Lunes", "horaInicio": "09:00", "horaFin": "12:00" },
        { "dia": "Martes", "horaInicio": "15:00", "horaFin": "18:00" },
        { "dia": "Miércoles", "horaInicio": "09:00", "horaFin": "12:00" },
        { "dia": "Jueves", "horaInicio": "15:00", "horaFin": "18:00" },
        { "dia": "Viernes", "horaInicio": "09:00", "horaFin": "12:00" }
      ]
    },
    {
      "dniKinesiologo": "32000004",
      "disponibilidad": [
        { "dia": "Lunes", "horaInicio": "10:00", "horaFin": "16:00" },
        { "dia": "Miércoles", "horaInicio": "10:00", "horaFin": "16:00" },
        { "dia": "Viernes", "horaInicio": "10:00", "horaFin": "16:00" }
      ]
    },
    {
      "dniKinesiologo": "35000005",
      "disponibilidad": [
        { "dia": "Martes", "horaInicio": "08:00", "horaFin": "16:00" },
        { "dia": "Jueves", "horaInicio": "08:00", "horaFin": "16:00" },
        { "dia": "Sábado", "horaInicio": "08:00", "horaFin": "12:00" }
      ]
    },
    {
      "dniKinesiologo": "38000006",
      "disponibilidad": [
        { "dia": "Lunes", "horaInicio": "08:00", "horaFin": "12:00" },
        { "dia": "Martes", "horaInicio": "08:00", "horaFin": "12:00" },
        { "dia": "Miércoles", "horaInicio": "08:00", "horaFin": "12:00" },
        { "dia": "Jueves", "horaInicio": "08:00", "horaFin": "12:00" },
        { "dia": "Viernes", "horaInicio": "08:00", "horaFin": "12:00" }
      ]
    },
    {
      "dniKinesiologo": "40000007",
      "disponibilidad": [
        { "dia": "Lunes", "horaInicio": "15:00", "horaFin": "21:00" },
        { "dia": "Miércoles", "horaInicio": "15:00", "horaFin": "21:00" },
        { "dia": "Viernes", "horaInicio": "15:00", "horaFin": "21:00" }
      ]
    },
    {
      "dniKinesiologo": "42000008",
      "disponibilidad": [
        { "dia": "Jueves", "horaInicio": "09:00", "horaFin": "19:00" },
        { "dia": "Sábado", "horaInicio": "09:00", "horaFin": "13:00" }
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
    { "nombre": "Kinesiología Deportiva", "descripcion": "Tratamiento de lesiones relacionadas con el deporte", "precioPorSesion": 12000, "duracionMinutos": 45 },
    { "nombre": "RPG", "descripcion": "Reeducación Postural Global", "precioPorSesion": 14000, "duracionMinutos": 60 },
    { "nombre": "Drenaje Linfático", "descripcion": "Técnica de masaje para estimular el sistema linfático", "precioPorSesion": 11000, "duracionMinutos": 45 },
    { "nombre": "Kinesiología Dermatofuncional", "descripcion": "Tratamientos estéticos y reparadores de la piel", "precioPorSesion": 13000, "duracionMinutos": 60 },
    { "nombre": "Traumatología", "descripcion": "Rehabilitación de lesiones óseas y musculares", "precioPorSesion": 12000, "duracionMinutos": 45 },
    { "nombre": "Fisioterapia", "descripcion": "Tratamientos mediante agentes físicos", "precioPorSesion": 9000, "duracionMinutos": 30 },
    { "nombre": "Estimulación Temprana", "descripcion": "Favorecimiento del desarrollo infantil", "precioPorSesion": 12000, "duracionMinutos": 45 },
    { "nombre": "Rehabilitación Respiratoria", "descripcion": "Mejora de la función pulmonar", "precioPorSesion": 11000, "duracionMinutos": 45 },
    { "nombre": "Entrevista inicial", "descripcion": "Primera consulta de evaluación", "precioPorSesion": 20000, "duracionMinutos": 60 }
  ],
  "pacientes": [
    { "dni": "30000001", "nombre": "Ana", "apellido": "Flores", "telefono": "3884111222", "fechaNacimiento": "1985-03-12", "obraSocialRnos": "010001", "numeroAfiliado": "A-123456" },
    { "dni": "33000002", "nombre": "Roberto", "apellido": "Mamani", "telefono": "3884333444", "fechaNacimiento": "1972-07-28", "obraSocialRnos": null, "numeroAfiliado": null },
    { "dni": "35000003", "nombre": "Lucía", "apellido": "Herrera", "telefono": "3884555666", "fechaNacimiento": "1990-11-05", "obraSocialRnos": "010002", "numeroAfiliado": "P-987654" },
    { "dni": "38000004", "nombre": "Carlos", "apellido": "Guzmán", "telefono": "3884777888", "fechaNacimiento": "1965-01-20", "obraSocialRnos": "010004", "numeroAfiliado": "SM-456123" },
    { "dni": "40000005", "nombre": "Elena", "apellido": "Vargas", "telefono": "3884999000", "fechaNacimiento": "1978-05-30", "obraSocialRnos": "010003", "numeroAfiliado": "I-321654" },
    { "dni": "42000006", "nombre": "Miguel", "apellido": "Soria", "telefono": "3884111333", "fechaNacimiento": "2005-09-15", "obraSocialRnos": null, "numeroAfiliado": null },
    { "dni": "45000007", "nombre": "Sofía", "apellido": "López", "telefono": "3884222444", "fechaNacimiento": "1995-12-08", "obraSocialRnos": "010001", "numeroAfiliado": "A-654321" }
  ],
  "turnos": [
    {
      "id": "1",
      "dniPaciente": "30000001",
      "dniKinesiologo": "25000001",
      "fecha": "2026-03-13",
      "hora": "09:00",
      "tratamiento": "Neurorrehabilitación",
      "motivoConsulta": "Control post-operatorio",
      "ordenMedica": null,
      "estado": "confirmado",
      "esParticular": false,
      "createdAt": "2026-03-10T10:00:00Z"
    },
    {
      "id": "2",
      "dniPaciente": "33000002",
      "dniKinesiologo": "25000001",
      "fecha": "2026-03-13",
      "hora": "10:00",
      "tratamiento": "Movimiento Eficiente",
      "motivoConsulta": "Dolor lumbar crónico",
      "ordenMedica": null,
      "estado": "confirmado",
      "esParticular": true,
      "createdAt": "2026-03-10T11:00:00Z"
    },
    {
      "id": "3",
      "dniPaciente": "35000003",
      "dniKinesiologo": "28000002",
      "fecha": "2026-03-13",
      "hora": "15:00",
      "tratamiento": "Osteopatía",
      "motivoConsulta": "Cervicalgia",
      "ordenMedica": null,
      "estado": "pendiente",
      "esParticular": false,
      "createdAt": "2026-03-10T15:00:00Z"
    },
    {
      "id": "4",
      "dniPaciente": "38000004",
      "dniKinesiologo": "30000003",
      "fecha": "2026-03-13",
      "hora": "10:00",
      "tratamiento": "Kinesiología Deportiva",
      "motivoConsulta": "Esguince de tobillo",
      "ordenMedica": null,
      "estado": "confirmado",
      "esParticular": false,
      "createdAt": "2026-03-10T09:00:00Z"
    },
    {
      "id": "5",
      "dniPaciente": "40000005",
      "dniKinesiologo": "32000004",
      "fecha": "2026-03-13",
      "hora": "11:00",
      "tratamiento": "Drenaje Linfático",
      "motivoConsulta": "Edema en miembros inferiores",
      "ordenMedica": null,
      "estado": "confirmado",
      "esParticular": false,
      "createdAt": "2026-03-10T08:00:00Z"
    }
  ],
  "cobros": [
    {
      "id": "c1",
      "turnoId": "1",
      "monto": 15000,
      "coseguro": 0,
      "fecha": "2026-03-13",
      "reembolso": null,
      "estado": "cobrado"
    },
    {
      "id": "c2",
      "turnoId": "2",
      "monto": 10000,
      "coseguro": 0,
      "fecha": "2026-03-13",
      "reembolso": null,
      "estado": "cobrado"
    },
    {
      "id": "c4",
      "turnoId": "4",
      "monto": 12000,
      "coseguro": 0,
      "fecha": "2026-03-13",
      "reembolso": null,
      "estado": "cobrado"
    },
    {
      "id": "c5",
      "turnoId": "5",
      "monto": 11000,
      "coseguro": 0,
      "fecha": "2026-03-13",
      "reembolso": null,
      "estado": "cobrado"
    }
  ]
}
