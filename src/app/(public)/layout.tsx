import type { ReactNode } from "react";
import { PublicFooter } from "@/shared/components";
import { PublicHeader } from "@/shared/components/PublicHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="serena-public-theme flex min-h-screen flex-col">
      <PublicHeader />
      <main className="serena-surface flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
