"use client";

import type { BloqueHorarioVista } from "@/shared/types/catalogo-medico";

const weekdayLabels = ["L", "M", "M", "J", "V", "S", "D"];
const dateParts = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Guatemala", year: "numeric", month: "2-digit", day: "2-digit",
});
const monthLabel = new Intl.DateTimeFormat("es-GT", { month: "long", year: "numeric", timeZone: "UTC" });
const fullDateLabel = new Intl.DateTimeFormat("es-GT", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function availabilityDateKey(startAt: string) {
  const parts = dateParts.formatToParts(new Date(startAt));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function utcDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

type AvailabilityCalendarProps = {
  bloques: BloqueHorarioVista[];
  selectedDate: string;
  onSelect: (date: string) => void;
};

export function AvailabilityCalendar({ bloques, selectedDate, onSelect }: AvailabilityCalendarProps) {
  const dates = [...new Set(bloques.map((bloque) => availabilityDateKey(bloque.startAt)))].sort();
  const selected = utcDate(selectedDate);
  const month = selected.getUTCMonth();
  const year = selected.getUTCFullYear();
  const first = new Date(Date.UTC(year, month, 1));
  const formattedMonth = monthLabel.format(first);
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7;
  const monthDates = dates.filter((date) => date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`));
  const previousDate = dates.filter((date) => date.slice(0, 7) < selectedDate.slice(0, 7)).at(-1);
  const nextDate = dates.find((date) => date.slice(0, 7) > selectedDate.slice(0, 7));
  const available = new Set(monthDates);
  const grid = Array.from({ length: Math.ceil((leading + daysInMonth) / 7) * 7 }, (_, index) => {
    const day = index - leading + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  return (
    <div className="serena-availability-calendar" aria-label="Calendario de horarios disponibles">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--serena-teal)]">Disponibilidad real</p><h4 className="mt-1 text-lg font-black text-[var(--serena-ink)]">{formattedMonth.charAt(0).toLocaleUpperCase("es-GT") + formattedMonth.slice(1)}</h4></div>
        <div className="flex gap-2">
          <button aria-label="Mes anterior con horarios" className="serena-calendar-arrow" disabled={!previousDate} onClick={() => previousDate && onSelect(previousDate)} type="button">‹</button>
          <button aria-label="Mes siguiente con horarios" className="serena-calendar-arrow" disabled={!nextDate} onClick={() => nextDate && onSelect(nextDate)} type="button">›</button>
        </div>
      </div>
      <div aria-hidden="true" className="serena-calendar-grid mt-5">{weekdayLabels.map((day, index) => <span className="serena-calendar-weekday" key={`${day}-${index}`}>{day}</span>)}</div>
      <div className="serena-calendar-grid mt-2">
        {grid.map((day, index) => {
          if (!day) return <span aria-hidden="true" key={`empty-${index}`} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const enabled = available.has(key);
          return <button
            aria-label={`${fullDateLabel.format(utcDate(key))}${enabled ? " · horarios disponibles" : " · sin horarios"}`}
            aria-pressed={enabled && selectedDate === key}
            className="serena-calendar-day"
            disabled={!enabled}
            key={key}
            onClick={() => onSelect(key)}
            type="button"
          >{day}{enabled ? <span aria-hidden="true" className="serena-calendar-dot" /> : null}</button>;
        })}
      </div>
      <p className="mt-4 text-xs leading-5 text-[var(--serena-text)]"><span aria-hidden="true" className="serena-calendar-legend-dot" /> Los puntos indican días con horarios publicados. Hora de Guatemala.</p>
    </div>
  );
}
