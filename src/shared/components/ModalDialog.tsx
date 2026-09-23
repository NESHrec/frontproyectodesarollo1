"use client";

import { useId, useState, type ReactNode } from "react";
import { Button } from "@/shared/components/Button";

type ModalDialogProps = {
  triggerLabel: string;
  title: string;
  description: string;
  children: ReactNode;
  triggerVariant?: "primary" | "secondary" | "accent" | "cream" | "ghost";
};

export function ModalDialog({ triggerLabel, title, description, children, triggerVariant = "primary" }: ModalDialogProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <>
      <Button onClick={() => setOpen(true)} variant={triggerVariant}>{triggerLabel}</Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#263238]/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section aria-describedby={descriptionId} aria-labelledby={titleId} aria-modal="true" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-[#FBFCFA] p-6 shadow-2xl" role="dialog">
            <div className="flex items-start justify-between gap-4 border-b border-[#62727B]/15 pb-4">
              <div><h2 className="text-xl font-bold text-[#62727B]" id={titleId}>{title}</h2><p className="mt-1 text-sm text-[#62727B]/75" id={descriptionId}>{description}</p></div>
              <Button aria-label="Cerrar diálogo" className="min-h-9 px-3" onClick={() => setOpen(false)} variant="ghost">Cerrar</Button>
            </div>
            <div className="pt-5">{children}</div>
          </section>
        </div>
      ) : null}
    </>
  );
}
