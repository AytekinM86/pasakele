import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin", "latin-ext"], weight: ["500", "600", "700"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin", "latin-ext", "cyrillic"], weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Pasakėlė",
  description: "Children tell their own stories to a listening owl, get a picture book back, and parents see gentle patterns over time.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
