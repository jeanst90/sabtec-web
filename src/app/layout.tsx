import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import SWRegister from "@/components/sw-register";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sabtec — Orçamentos e Garantias",
  description:
    "Sistema Sabtec para geração de orçamentos e termos de garantia em PDF com identidade visual da marca.",
  applicationName: "Sabtec",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#f95610",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-primary">
        <SWRegister />
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-accent text-white px-3 py-2 rounded z-50">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}