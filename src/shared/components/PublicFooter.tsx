import Link from "next/link";
import { clinicaInfo } from "@/modules/catalogo-medico/data";

export function PublicFooter() {
  return (
    <footer className="border-t border-[#62727B]/15 bg-[#E5F1D8]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-[#62727B] sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-bold">{clinicaInfo.nombre}</p>
          <p className="mt-2 leading-6">{clinicaInfo.lema}</p>
        </div>
        <div>
          <p className="font-semibold">Contacto</p>
          <p className="mt-2">{clinicaInfo.telefono}</p>
          <p>{clinicaInfo.correo}</p>
        </div>
        <div>
          <p className="font-semibold">Acceso</p>
          <div className="mt-2 flex flex-col gap-1">
            <Link className="hover:underline" href="/registro">
              Registro visual
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
