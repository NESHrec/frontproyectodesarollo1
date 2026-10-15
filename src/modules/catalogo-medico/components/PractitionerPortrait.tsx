import Image from "next/image";
import type { Medico } from "@/shared/types/catalogo-medico";

export function PractitionerPortrait({ practitioner, large = false }: { practitioner: Medico; large?: boolean }) {
  const classes = large ? "h-64 w-full rounded-xl" : "h-44 w-full rounded-xl";
  if (practitioner.photoUrl && practitioner.active) {
    const version = practitioner.photoUrl.split("?v=")[1] ?? "";
    return <Image alt={`Fotografía de ${practitioner.fullName}`} className={`${classes} object-cover`} height={large ? 256 : 176} src={`/api/public/medicos/${encodeURIComponent(practitioner.id)}/foto?v=${encodeURIComponent(version)}`} unoptimized width={640} />;
  }
  const initials = practitioner.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "CS";
  return <div aria-label={`Sin fotografía de ${practitioner.fullName}`} className={`${classes} grid place-items-center bg-[#DDF3F1] text-4xl font-black text-[#56777A]`} role="img"><span aria-hidden="true">{initials}</span></div>;
}
