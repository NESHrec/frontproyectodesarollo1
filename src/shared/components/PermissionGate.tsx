import type { ReactNode } from "react";
import type { InternalRole } from "@/shared/types/internal";

type PermissionGateProps = {
  role: InternalRole;
  allowedRoles: InternalRole[];
  mode?: "hide" | "disable";
  children: ReactNode;
  reason?: string;
};

/**
 * Demostración exclusivamente visual. Ocultar o deshabilitar controles en el
 * cliente no autoriza operaciones. La autorización real deberá validarse en
 * cada endpoint del backend con Spring Security.
 */
export function PermissionGate({
  role,
  allowedRoles,
  mode = "hide",
  children,
  reason = "Acción no disponible para este rol.",
}: PermissionGateProps) {
  const allowed = allowedRoles.includes(role);
  if (allowed) return <>{children}</>;
  if (mode === "hide") return null;

  return (
    <span aria-disabled="true" className="inline-flex cursor-not-allowed opacity-45" title={reason}>
      <span className="pointer-events-none">{children}</span>
    </span>
  );
}
