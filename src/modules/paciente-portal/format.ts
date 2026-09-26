const dateFormatter = new Intl.DateTimeFormat("es-GT", {
  timeZone: "America/Guatemala",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("es-GT", {
  currency: "GTQ",
  style: "currency",
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T12:00:00`));
}

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}
