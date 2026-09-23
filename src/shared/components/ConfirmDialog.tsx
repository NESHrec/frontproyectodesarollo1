"use client";

import { useId, useState } from "react";
import { Button } from "@/shared/components/Button";

type ConfirmDialogProps = {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  simulatedResult: string;
};

export function ConfirmDialog({ triggerLabel, title, description, confirmLabel, simulatedResult }: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const titleId = useId();

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <Button onClick={() => setOpen(true)} variant="ghost">{triggerLabel}</Button>
      {message ? <span className="text-xs font-semibold text-[#62727B]" role="status">{message}</span> : null}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#263238]/45 p-4">
          <section aria-labelledby={titleId} aria-modal="true" className="w-full max-w-md rounded-xl bg-[#FBFCFA] p-6 shadow-2xl" role="alertdialog">
            <h2 className="text-xl font-bold text-[#62727B]" id={titleId}>{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#62727B]/80">{description}</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setOpen(false)} variant="ghost">Volver</Button>
              <Button onClick={() => { setMessage(simulatedResult); setOpen(false); }} variant="accent">{confirmLabel}</Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
