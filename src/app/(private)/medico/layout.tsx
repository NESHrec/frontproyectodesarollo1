import type { ReactNode } from "react";

import { StaffAreaGuard } from "@/modules/auth/components/StaffAreaGuard";

export default function MedicalLayout({ children }: { children: ReactNode }) {
  return <StaffAreaGuard allowedRoles={["MEDICO"]} area="/medico" fallback="/recepcion" fallbackByRole={{ ADMIN: "/admin" }}>{children}</StaffAreaGuard>;
}
