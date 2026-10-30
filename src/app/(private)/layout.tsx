import type { ReactNode } from "react";
import { AppShell } from "@/shared/components";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
