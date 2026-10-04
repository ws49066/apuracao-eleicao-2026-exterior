import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apuração 2026 · Voto no Exterior",
  description:
    "Acompanhamento da apuração para Presidente da República entre os eleitores brasileiros no exterior, com filtro por país e por cidade. Dados oficiais do TSE.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
