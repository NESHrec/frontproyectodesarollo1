import Link from "next/link";
import { clinicaInfo } from "@/modules/catalogo-medico/data";

export function PublicFooter() {
  return (
    <footer className="border-t border-[#62727B]/10 bg-[#334B54] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-base font-bold">{clinicaInfo.nombre}</p>
          <p className="mt-2 leading-6 text-white/75">{clinicaInfo.lema}</p>
        </div>
        <div>
          <p className="font-semibold">Tu atención</p>
          <p className="mt-2 leading-6 text-white/75">Consulta la disponibilidad publicada y reserva desde tu cuenta de paciente.</p>
        </div>
        <div>
          <p className="font-semibold">Acceso</p>
          <div className="mt-2 flex flex-col gap-2 text-white/75">
            <Link className="hover:underline" href="/registro">
              Crear cuenta
            </Link>
            <Link className="hover:underline" href="/recuperar-contrasena">
              Recuperar contraseña
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
