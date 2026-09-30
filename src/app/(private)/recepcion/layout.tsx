import type { ReactNode } from "react";

import { StaffAreaGuard } from "@/modules/auth/components/StaffAreaGuard";

export default function ReceptionLayout({ children }: { children: ReactNode }) {
  return <StaffAreaGuard allowedRoles={["RECEPCION", "ADMIN"]} area="/recepcion" fallback="/medico">{children}</StaffAreaGuard>;
}
