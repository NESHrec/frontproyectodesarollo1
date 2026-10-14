"use client";

import { useEffect, useId, useState } from "react";
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

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <Button onClick={() => setOpen(true)} variant="ghost">{triggerLabel}</Button>
      {message ? <span className="text-xs font-semibold text-[#62727B]" role="status">{message}</span> : null}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--serena-overlay)_45%,transparent)] p-4 motion-safe:animate-[serena-fade-in_180ms_ease-out]">
          <section aria-describedby={`${titleId}-description`} aria-labelledby={titleId} aria-modal="true" className="w-full max-w-md rounded-[var(--serena-radius-lg)] bg-[var(--serena-surface)] p-6 shadow-[var(--serena-shadow-dialog)]" role="alertdialog">
            <h2 className="text-xl font-bold text-[#62727B]" id={titleId}>{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--serena-text)]/80" id={`${titleId}-description`}>{description}</p>
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
