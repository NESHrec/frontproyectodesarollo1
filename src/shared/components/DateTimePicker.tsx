import type { InputHTMLAttributes } from "react";
import { Input } from "@/shared/components/Input";

type DateTimePickerProps = {
  dateProps: InputHTMLAttributes<HTMLInputElement>;
  timeProps: InputHTMLAttributes<HTMLInputElement>;
  dateError?: string;
  timeError?: string;
};

export function DateTimePicker({ dateProps, timeProps, dateError, timeError }: DateTimePickerProps) {
  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="sr-only">Fecha y hora</legend>
      <Input label="Fecha" type="date" error={dateError} {...dateProps} />
      <Input label="Hora" type="time" error={timeError} {...timeProps} />
    </fieldset>
  );
}
