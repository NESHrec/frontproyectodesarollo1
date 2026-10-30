"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ErrorState } from "@/shared/components/ErrorState";

type ApiErrorStateProps = {
  title?: string;
  description?: string;
};

/**
 * Estado de error para datos del API. El reintento vuelve a solicitar al
 * servidor los componentes de la ruta actual sin recargar la página.
 */
export function ApiErrorState({
  title = "No pudimos conectar con Clínica Serena",
  description = "El servicio no está disponible en este momento. Revisa tu conexión e inténtalo de nuevo en unos segundos.",
}: ApiErrorStateProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <ErrorState
      description={description}
      isRetrying={isPending}
      onRetry={() => startTransition(() => router.refresh())}
      title={title}
    />
  );
}
