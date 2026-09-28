import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clínica Serena",
  description:
    "Portal público académico para gestión visual de citas y catálogo médico.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col bg-[#FBFCFA] text-[#62727B]">
        {children}
      </body>
    </html>
  );
}
