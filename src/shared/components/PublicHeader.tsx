import Link from "next/link";
import { getStaffSessionState } from "@/modules/auth/staff-session";
import { PublicNavigation } from "@/shared/components/PublicNavigation";

const staffDestinations = {
  ADMIN: { href: "/admin", label: "Volver a administración" },
  RECEPCION: { href: "/recepcion", label: "Volver a recepción" },
  MEDICO: { href: "/medico", label: "Volver a mi área médica" },
} as const;

export async function PublicHeader() {
  const staffSession = await getStaffSessionState();
  const destination = staffSession.status === "active" ? staffDestinations[staffSession.identity.role] : null;

  return (
    <header className="serena-public-header sticky top-0 z-40 border-b border-[var(--serena-border)] bg-white/90 shadow-[0_10px_26px_rgb(51_75_84_/_0.05)] backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link
          className="inline-flex w-fit items-center gap-3 pr-14 text-lg font-extrabold tracking-tight text-[#334B54] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#62727B] lg:pr-0"
          href="/"
        >
          <span aria-hidden="true" className="serena-brand-mark grid size-10 place-items-center rounded-2xl bg-[var(--serena-ink)] text-xs font-black tracking-wide text-white shadow-[var(--serena-shadow-soft)]">CS</span>
          Clínica Serena
        </Link>
        <PublicNavigation destination={destination} />
      </div>
    </header>
  );
}
