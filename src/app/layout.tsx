import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PastryPro — Gestión para Reposteras",
  description:
    "La plataforma más completa para gestionar tu negocio de repostería. Insumos, recetas, presupuestos y ventas en USD y Bs.",
  keywords: ["repostería", "gestión", "pastelería", "presupuestos", "ventas"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
