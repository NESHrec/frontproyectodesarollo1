"use client";

import Image from "next/image";
import { useState } from "react";
import type { Medico } from "@/shared/types/catalogo-medico";

export function PractitionerPortrait({ practitioner, large = false }: { practitioner: Medico; large?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const classes = large ? "h-64 w-full rounded-[1.35rem]" : "h-44 w-full rounded-[1.15rem]";
  if (practitioner.photoUrl && practitioner.active && !imageFailed) {
    const version = practitioner.photoUrl.split("?v=")[1] ?? "";
    return <Image alt={`Fotografía de ${practitioner.fullName}`} className={`${classes} object-cover`} height={large ? 256 : 176} onError={() => setImageFailed(true)} src={`/api/public/medicos/${encodeURIComponent(practitioner.id)}/foto?v=${encodeURIComponent(version)}`} unoptimized width={640} />;
  }
  const initials = practitioner.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "CS";
  const accent = practitioner.specialtyId.split("").reduce((value, character) => value + character.charCodeAt(0), 0) % 3;
  return (
    <div aria-label={`Retrato ilustrativo de ${practitioner.fullName}, iniciales ${initials}`} className={`serena-practitioner-placeholder serena-practitioner-placeholder-${accent} ${classes}`} role="img">
      <span aria-hidden="true" className="serena-practitioner-orbit" />
      <span aria-hidden="true" className="serena-practitioner-monogram">{initials}</span>
      {practitioner.specialtyName ? <span aria-hidden="true" className="serena-practitioner-specialty">{practitioner.specialtyName}</span> : null}
      <span aria-hidden="true" className="serena-practitioner-caption">Clínica Serena</span>
    </div>
  );
}
