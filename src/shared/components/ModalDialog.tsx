"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/components/Button";

const MODAL_OPEN_EVENT = "serena:modal-open";

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
  const dialogId = useId();

  useEffect(() => {
    if (!open) return;
    const closeWhenAnotherOpens = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== dialogId) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener(MODAL_OPEN_EVENT, closeWhenAnotherOpens);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener(MODAL_OPEN_EVENT, closeWhenAnotherOpens);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dialogId, open]);

  function openDialog() {
    window.dispatchEvent(new CustomEvent(MODAL_OPEN_EVENT, { detail: dialogId }));
    setOpen(true);
  }

  const dialog = open ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[color-mix(in_srgb,var(--serena-overlay)_45%,transparent)] p-4 motion-safe:animate-[serena-fade-in_180ms_ease-out]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section aria-describedby={descriptionId} aria-labelledby={titleId} aria-modal="true" className="relative z-[101] flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-y-auto overscroll-contain rounded-[var(--serena-radius-lg)] bg-[var(--serena-surface)] p-6 shadow-[var(--serena-shadow-dialog)]" role="dialog">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#62727B]/15 pb-4">
          <div><h2 className="text-xl font-bold text-[#62727B]" id={titleId}>{title}</h2><p className="mt-1 text-sm text-[#62727B]/75" id={descriptionId}>{description}</p></div>
          <Button aria-label="Cerrar diálogo" className="min-h-9 shrink-0 px-3" onClick={() => setOpen(false)} variant="ghost">Cerrar</Button>
        </div>
        <div className="min-h-0 pt-5">{children}</div>
      </section>
    </div>
  ) : null;

  return (
    <>
      <Button onClick={openDialog} variant={triggerVariant}>{triggerLabel}</Button>
      {dialog && typeof document !== "undefined" ? createPortal(dialog, document.body) : null}
    </>
  );
}
