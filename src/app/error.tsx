"use client";

import { ErrorState } from "@/shared/components/ErrorState";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#FBFCFA] px-4 py-16">
      <div className="w-full max-w-2xl">
        <ErrorState
          description="La interfaz encontró un problema inesperado. Puedes intentar cargar esta sección de nuevo."
          onRetry={reset}
          title="No pudimos mostrar esta pantalla"
        />
      </div>
    </main>
  );
}
