import { internalNavigation } from "@/shared/config/internal-navigation";
import type { InternalRole } from "@/shared/types/internal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { StaffLogoutButton } from "@/modules/auth/components/StaffLogoutButton";
import { PatientLogoutButton } from "@/modules/auth/components/PatientLogoutButton";

export function Topbar({ role }: { role: InternalRole }) {
  const navigation = internalNavigation[role];
  const isPatient = role === "paciente";
  return (
    <header className="flex flex-col gap-3 border-b border-[#62727B]/15 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <div><p className="text-sm font-bold text-[#62727B]">{navigation.label}</p><p className="text-xs text-[#62727B]/65">{isPatient ? "Acceso verificado de paciente" : "Entorno académico · datos ficticios"}</p></div>
      <div className="flex items-center gap-3">
        <StatusBadge tone={isPatient ? "pistacho" : "crema"}>{isPatient ? "Sesión protegida" : "Sesión de personal"}</StatusBadge>
        {isPatient ? <PatientLogoutButton /> : <StaffLogoutButton />}
      </div>
    </header>
  );
}
