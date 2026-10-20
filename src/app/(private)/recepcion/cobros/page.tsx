import { ReceptionBillingClient } from "@/modules/pagos/components/ReceptionBillingClient";
import { StaffAreaGuard } from "@/modules/auth/components/StaffAreaGuard";

export default function ReceptionPaymentsPage() {
  return (
    <StaffAreaGuard allowedRoles={["RECEPCION"]} area="/recepcion/cobros" fallback="/admin">
      <ReceptionBillingClient />
    </StaffAreaGuard>
  );
}
