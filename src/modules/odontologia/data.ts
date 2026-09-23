export type ToothState = "Sano" | "Observación" | "Tratamiento" | "Ausente";
export type Tooth = { number: number; state: ToothState };

export const teeth: Tooth[] = [
  ...Array.from({ length: 8 }, (_, index) => ({ number: 18 - index, state: "Sano" as ToothState })),
  ...Array.from({ length: 8 }, (_, index) => ({ number: 21 + index, state: "Sano" as ToothState })),
  ...Array.from({ length: 8 }, (_, index) => ({ number: 48 - index, state: "Sano" as ToothState })),
  ...Array.from({ length: 8 }, (_, index) => ({ number: 31 + index, state: "Sano" as ToothState })),
].map((tooth) => tooth.number === 16 ? { ...tooth, state: "Observación" } : tooth.number === 26 ? { ...tooth, state: "Tratamiento" } : tooth.number === 38 ? { ...tooth, state: "Ausente" } : tooth);
