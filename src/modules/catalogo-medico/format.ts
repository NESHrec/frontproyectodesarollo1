import type {
  BloqueDisponibilidad,
  BloqueHorarioVista,
} from "@/shared/types/catalogo-medico";

const TIME_ZONE = "America/Guatemala";

const fechaFormatter = new Intl.DateTimeFormat("es-GT", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const horaFormatter = new Intl.DateTimeFormat("es-GT", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

function capitalizar(texto: string) {
  return texto.charAt(0).toLocaleUpperCase("es-GT") + texto.slice(1);
}

/**
 * Convierte un bloque del API a textos en hora de Guatemala. Se ejecuta en el
 * servidor para que el cliente reciba cadenas ya formateadas y no haya
 * diferencias de hidratación entre entornos.
 */
export function toBloqueHorarioVista(bloque: BloqueDisponibilidad): BloqueHorarioVista {
  const inicio = new Date(bloque.startAt);
  const fin = new Date(bloque.endAt);

  return {
    id: bloque.id,
    fecha: capitalizar(fechaFormatter.format(inicio)),
    horaInicio: horaFormatter.format(inicio),
    horaFin: horaFormatter.format(fin),
  };
}

export function ordenarBloques(bloques: BloqueDisponibilidad[]) {
  return [...bloques].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
}
