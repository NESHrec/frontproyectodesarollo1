import type { ReactNode } from "react";
import { PublicFooter, PublicHeader } from "@/shared/components";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </>
  );
}
