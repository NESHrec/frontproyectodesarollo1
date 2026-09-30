"use client";

import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

import type { ConsultationFormValues } from "@/modules/expedientes/schemas";
import { MAX_PRESCRIPTION_ITEMS, emptyPrescriptionItem } from "@/modules/recetas/schemas";
import { Button, Input } from "@/shared/components";

type PrescriptionFieldsProps = {
  control: Control<ConsultationFormValues>;
  register: UseFormRegister<ConsultationFormValues>;
  errors: FieldErrors<ConsultationFormValues>;
  disabled?: boolean;
};

/** Medicamentos de la receta que se guardan junto con la atención de la cita. */
export function PrescriptionFields({ control, register, errors, disabled }: PrescriptionFieldsProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "prescription" });

  return (
    <fieldset className="space-y-4" disabled={disabled}>
      <legend className="text-lg font-bold text-[#62727B]">Receta</legend>
      <p className="text-sm text-[#62727B]/80">
        Agrega hasta {MAX_PRESCRIPTION_ITEMS} medicamentos. Deja la receta vacía si no se indica ninguno.
      </p>
      {fields.length === 0 ? <p className="rounded-md bg-[#F8EDD2] px-4 py-3 text-sm">Sin medicamentos agregados.</p> : null}
      {fields.map((field, index) => {
        const itemErrors = errors.prescription?.[index];
        return (
          <div className="space-y-4 rounded-lg border border-[#62727B]/15 p-4" key={field.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold">Medicamento {index + 1}</p>
              <Button onClick={() => remove(index)} variant="ghost">Quitar</Button>
            </div>
            <Input error={itemErrors?.medicine?.message} id={`prescription-${index}-medicine`} label="Medicamento" {...register(`prescription.${index}.medicine`)} />
            <div className="grid gap-4 md:grid-cols-3">
              <Input error={itemErrors?.dose?.message} id={`prescription-${index}-dose`} label="Dosis" {...register(`prescription.${index}.dose`)} />
              <Input error={itemErrors?.frequency?.message} id={`prescription-${index}-frequency`} label="Frecuencia" {...register(`prescription.${index}.frequency`)} />
              <Input error={itemErrors?.duration?.message} id={`prescription-${index}-duration`} label="Duración" {...register(`prescription.${index}.duration`)} />
            </div>
            <Input error={itemErrors?.instructions?.message} id={`prescription-${index}-instructions`} label="Indicaciones (opcional)" {...register(`prescription.${index}.instructions`)} />
          </div>
        );
      })}
      {errors.prescription?.message ? <p className="rounded-md bg-[#F8E2E8] px-3 py-2 text-sm" role="alert">{errors.prescription.message}</p> : null}
      <Button disabled={fields.length >= MAX_PRESCRIPTION_ITEMS} onClick={() => append({ ...emptyPrescriptionItem })} variant="secondary">
        Agregar medicamento
      </Button>
    </fieldset>
  );
}
