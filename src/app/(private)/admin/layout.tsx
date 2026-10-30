import type { ReactNode } from "react";

import { StaffAreaGuard } from "@/modules/auth/components/StaffAreaGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <StaffAreaGuard allowedRoles={["ADMIN"]} area="/admin" fallback="/recepcion">{children}</StaffAreaGuard>;
}
