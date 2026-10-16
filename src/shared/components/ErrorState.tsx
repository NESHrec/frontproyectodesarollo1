"use client";

import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";

type ErrorStateProps = {
  title: string;
  description: string;
  onRetry?: () => void;
  isRetrying?: boolean;
};

export function ErrorState({ title, description, onRetry, isRetrying = false }: ErrorStateProps) {
  return (
    <Card className="serena-state text-center" role="alert">
      <p aria-hidden="true" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--serena-danger-soft)] text-lg font-bold text-[var(--serena-danger)]">
        !
      </p>
      <h2 className="text-xl font-black text-[var(--serena-ink)]">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#62727B]/80">
        {description}
      </p>
      {onRetry ? (
        <Button className="mt-6" disabled={isRetrying} onClick={onRetry} variant="accent">
          {isRetrying ? "Reintentando..." : "Intentar nuevamente"}
        </Button>
      ) : null}
    </Card>
  );
}
