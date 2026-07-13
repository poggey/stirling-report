import type { Metadata } from "next";
import { Fraunces, Archivo, Archivo_Narrow } from "next/font/google";
import { LearnProvider } from "@/components/learn/LearnProvider";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const archivoNarrow = Archivo_Narrow({
  variable: "--font-archivo-narrow",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stirling — The Daily Economic Intelligence Terminal",
  description:
    "A free, automated daily economic briefing: markets, macro and the story of the day, issued as one immutable edition every evening.",
  openGraph: {
    title: "Stirling — The Daily Economic Intelligence Terminal",
    images: ["/api/og/latest"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${fraunces.variable} ${archivo.variable} ${archivoNarrow.variable}`}
    >
      <body>
        <LearnProvider>
          <SiteChrome />
          {children}
        </LearnProvider>
        <script
          src="https://cdn.jsdelivr.net/gh/poggey/built-by@main/built-by.js"
          data-name="Padraig Middleton"
          data-github="https://github.com/poggey"
          defer
        />
      </body>
    </html>
  );
}
