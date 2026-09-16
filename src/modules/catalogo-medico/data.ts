import type {
  ClinicaInfo,
  Especialidad,
  HorarioDisponible,
  Medico,
} from "@/shared/types/catalogo-medico";

export const clinicaInfo: ClinicaInfo = {
  nombre: "Clínica Serena",
  lema: "Atención médica y odontológica con calma, claridad y confianza.",
  descripcion:
    "Plataforma académica para visualizar servicios, profesionales y un flujo inicial de pre-agendamiento. Los datos son ficticios y no representan pacientes reales.",
  direccion: "Zona 10, Ciudad de Guatemala",
  telefono: "2234-0000",
  correo: "contacto@clinicaserena.test",
  horarios: [
    "Lunes a viernes: 08:00 a 17:00",
    "Sábado: 08:00 a 12:00",
    "Domingo: cerrado",
  ],
};

export const especialidades: Especialidad[] = [
  {
    id: "medicina-general",
    nombre: "Medicina general",
    categoria: "medica",
    descripcion:
      "Evaluación primaria, control preventivo y orientación para tratamientos posteriores.",
  },
  {
    id: "pediatria",
    nombre: "Pediatría",
    categoria: "medica",
    descripcion:
      "Seguimiento integral para niñas, niños y adolescentes en un entorno amable.",
  },
  {
    id: "ginecologia",
    nombre: "Ginecología",
    categoria: "medica",
    descripcion:
      "Controles preventivos y acompañamiento clínico con enfoque respetuoso.",
  },
  {
    id: "odontologia-general",
    nombre: "Odontología general",
    categoria: "odontologica",
    descripcion:
      "Diagnóstico, limpiezas, restauraciones y educación para salud oral.",
  },
  {
    id: "ortodoncia",
    nombre: "Ortodoncia",
    categoria: "odontologica",
    descripcion:
      "Valoración y seguimiento visual para alineación dental y mordida.",
  },
  {
    id: "periodoncia",
    nombre: "Periodoncia",
    categoria: "odontologica",
    descripcion:
      "Cuidado preventivo y terapéutico de encías y tejidos de soporte dental.",
  },
];

export const medicos: Medico[] = [
  {
    id: "dra-sofia-alvarado",
    nombre: "Dra. Sofía Alvarado",
    especialidadId: "medicina-general",
    especialidad: "Medicina general",
    enfoque: "Prevención y control familiar",
    experiencia: "8 años de experiencia",
    ubicacion: "Consultorio 1",
    disponibilidad: "Lunes, miércoles y viernes",
    biografia:
      "Acompaña consultas de primer contacto con énfasis en prevención, seguimiento claro y comunicación sencilla.",
  },
  {
    id: "dr-mateo-castillo",
    nombre: "Dr. Mateo Castillo",
    especialidadId: "pediatria",
    especialidad: "Pediatría",
    enfoque: "Crecimiento y desarrollo",
    experiencia: "10 años de experiencia",
    ubicacion: "Consultorio 2",
    disponibilidad: "Martes y jueves",
    biografia:
      "Atiende controles pediátricos simulados con una experiencia visual cercana para familias.",
  },
  {
    id: "dra-elena-rojas",
    nombre: "Dra. Elena Rojas",
    especialidadId: "ginecologia",
    especialidad: "Ginecología",
    enfoque: "Salud preventiva",
    experiencia: "9 años de experiencia",
    ubicacion: "Consultorio 3",
    disponibilidad: "Lunes a jueves",
    biografia:
      "Presenta atención preventiva con información ordenada, privacidad visual y acompañamiento respetuoso.",
  },
  {
    id: "dra-valeria-mendez",
    nombre: "Dra. Valeria Méndez",
    especialidadId: "odontologia-general",
    especialidad: "Odontología general",
    enfoque: "Cuidado oral preventivo",
    experiencia: "7 años de experiencia",
    ubicacion: "Clínica dental A",
    disponibilidad: "Lunes, martes y sábado",
    biografia:
      "Orienta consultas odontológicas generales con énfasis en hábitos preventivos y revisiones periódicas.",
  },
  {
    id: "dr-andres-lima",
    nombre: "Dr. Andrés Lima",
    especialidadId: "ortodoncia",
    especialidad: "Ortodoncia",
    enfoque: "Alineación dental",
    experiencia: "11 años de experiencia",
    ubicacion: "Clínica dental B",
    disponibilidad: "Miércoles y viernes",
    biografia:
      "Muestra un perfil de ortodoncia para valoraciones iniciales y seguimiento de planes visuales.",
  },
  {
    id: "dra-camila-estrada",
    nombre: "Dra. Camila Estrada",
    especialidadId: "periodoncia",
    especialidad: "Periodoncia",
    enfoque: "Salud de encías",
    experiencia: "6 años de experiencia",
    ubicacion: "Clínica dental C",
    disponibilidad: "Martes, jueves y sábado",
    biografia:
      "Apoya el cuidado periodontal preventivo con información clara y bloques de disponibilidad simulados.",
  },
];

export const horariosDisponibles: HorarioDisponible[] = [
  {
    medicoId: "dra-sofia-alvarado",
    fecha: "2026-09-21",
    bloques: ["08:30", "10:00", "14:30"],
  },
  {
    medicoId: "dr-mateo-castillo",
    fecha: "2026-09-22",
    bloques: ["09:00", "11:30", "15:00"],
  },
  {
    medicoId: "dra-elena-rojas",
    fecha: "2026-09-23",
    bloques: ["08:00", "10:30", "16:00"],
  },
  {
    medicoId: "dra-valeria-mendez",
    fecha: "2026-09-24",
    bloques: ["08:45", "12:00", "15:30"],
  },
  {
    medicoId: "dr-andres-lima",
    fecha: "2026-09-25",
    bloques: ["09:30", "13:00", "16:30"],
  },
  {
    medicoId: "dra-camila-estrada",
    fecha: "2026-09-26",
    bloques: ["08:15", "10:45", "12:15"],
  },
];

export function getMedicoById(medicoId: string) {
  return medicos.find((medico) => medico.id === medicoId);
}

export function getHorariosByMedicoId(medicoId: string) {
  return horariosDisponibles.filter((horario) => horario.medicoId === medicoId);
}
