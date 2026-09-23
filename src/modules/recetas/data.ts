export type Prescription = { id: string; date: string; patient: string; medicine: string; instructions: string; professional: string };
export const prescriptions: Prescription[] = [
  { id: "RX-301", date: "16 sep 2026", patient: "Ana Lucía Prado", medicine: "Medicamento ficticio A", instructions: "1 unidad cada 12 horas · 5 días", professional: "Dra. Sofía Alvarado" },
  { id: "RX-298", date: "03 jun 2026", patient: "María Fernanda Solís", medicine: "Enjuague ficticio B", instructions: "Uso simulado cada 8 horas · 7 días", professional: "Dra. Valeria Méndez" },
  { id: "RX-287", date: "14 abr 2026", patient: "Sofía Isabel Ríos", medicine: "Producto ficticio C", instructions: "Aplicación académica nocturna · 10 días", professional: "Dr. Andrés Lima" },
];
