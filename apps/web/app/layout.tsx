import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Z-World — laboratorio de simulación",
  description: "Primer laboratorio jugable de la línea web de Z-World.",
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
