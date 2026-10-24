"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <main style={{ fontFamily: "Arial, sans-serif", padding: "3rem" }}>
          <h1>No pudimos cargar Clínica Serena</h1>
          <p>Intenta cargar la aplicación nuevamente.</p>
          <button onClick={() => reset()} type="button">
            Intentar de nuevo
          </button>
        </main>
      </body>
    </html>
  );
}
