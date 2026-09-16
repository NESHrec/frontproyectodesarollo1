import Link from "next/link";
import { buttonLinkClasses, EmptyState } from "@/shared/components";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#FBFCFA] px-4 py-16">
      <div className="w-full max-w-2xl">
        <EmptyState
          action={
            <Link className={buttonLinkClasses} href="/">
              Volver al inicio
            </Link>
          }
          description="La ruta solicitada no existe dentro del portal público de Clínica Serena."
          title="Página no encontrada"
        />
      </div>
    </main>
  );
}
