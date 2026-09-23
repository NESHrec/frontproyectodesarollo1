export type ClinicalEvent = { id: string; date: string; professional: string; title: string; summary: string; status: string };

export const clinicalTimeline: ClinicalEvent[] = [
  { id: "evt-1", date: "16 sep 2026", professional: "Dra. Sofía Alvarado", title: "Control preventivo ficticio", summary: "Registro académico de signos generales estables y orientación preventiva simulada.", status: "Finalizada" },
  { id: "evt-2", date: "12 ago 2026", professional: "Dra. Valeria Méndez", title: "Evaluación odontológica ficticia", summary: "Revisión visual simulada con recomendación académica de higiene oral.", status: "Finalizada" },
  { id: "evt-3", date: "03 jun 2026", professional: "Dra. Sofía Alvarado", title: "Consulta general ficticia", summary: "Motivo, diagnóstico y observaciones completamente inventados para la interfaz.", status: "Finalizada" },
];
