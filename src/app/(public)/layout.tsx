import type { ReactNode } from "react";
import { PublicFooter } from "@/shared/components";
import { PublicHeader } from "@/shared/components/PublicHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </>
  );
}
