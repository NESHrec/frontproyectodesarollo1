import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clínica Serena",
  description:
    "Portal público académico para gestión visual de citas y catálogo médico.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col bg-[#FBFCFA] text-[#62727B]">
        <a className="skip-link" href="#contenido-principal">
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
