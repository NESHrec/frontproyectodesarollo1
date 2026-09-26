export type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Devuelve el primer valor no vacío de un parámetro de búsqueda. */
export function firstSearchParam(value: string | string[] | undefined) {
  const first = Array.isArray(value) ? value[0] : value;
  const trimmed = first?.trim();
  return trimmed ? trimmed : undefined;
}
