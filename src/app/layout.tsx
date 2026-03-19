import type { Metadata, Viewport } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import Script from "next/script";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VoidArchive — Sincere Bhattarai",
    template: "%s | VoidArchive",
  },
  description:
    "The official digital archive and portfolio of Sincere Bhattarai. A refined, high-fidelity collection of academic and creative work.",
  keywords: ["VoidArchive", "Sincere Bhattarai", "presentations", "archive", "portfolio"],
  authors: [{ name: "Sincere Bhattarai" }],
  creator: "Sincere Bhattarai",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "VoidArchive",
    title: "VoidArchive — Sincere Bhattarai",
    description: "High-fidelity digital archive of Sincere Bhattarai's academic work.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoidArchive",
    description: "High-fidelity digital archive.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDF7FF" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0D11" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { Footer } from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full`}
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('va-theme');
                var d = document.documentElement;
                if (t === 'dark') d.classList.add('dark');
                else if (t === 'light') d.classList.remove('dark');
                else if (window.matchMedia('(prefers-color-scheme: dark)').matches) d.classList.add('dark');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)] transition-colors duration-300">
        <ThemeProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
