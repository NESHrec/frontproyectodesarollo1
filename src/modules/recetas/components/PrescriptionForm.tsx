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
    <fieldset className="space-y-5 rounded-2xl border border-[#62727B]/12 bg-white p-4 shadow-[0_14px_38px_-34px_rgba(38,50,56,.6)] sm:p-6" disabled={disabled}>
      <legend className="px-2 text-lg font-black text-[#334B54]">Receta</legend>
      <p className="text-sm text-[#62727B]/80">
        Agrega hasta {MAX_PRESCRIPTION_ITEMS} medicamentos. Deja la receta vacía si no se indica ninguno.
      </p>
      {fields.length === 0 ? <div className="rounded-2xl border border-dashed border-[#8D6B2E]/25 bg-[#F8EDD2]/65 px-4 py-5 text-center"><p className="text-sm font-semibold text-[#334B54]">Sin medicamentos agregados</p><p className="mt-1 text-xs text-[#62727B]">La atención puede guardarse sin receta.</p></div> : null}
      {fields.map((field, index) => {
        const itemErrors = errors.prescription?.[index];
        return (
          <div className="space-y-4 rounded-2xl border border-[#62727B]/15 bg-[#FBFCFA] p-4 sm:p-5" key={field.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-[#334B54]"><span aria-hidden className="grid size-7 place-items-center rounded-full bg-[#DDF3F1] text-xs">{index + 1}</span>Medicamento {index + 1}</p>
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
