import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { PageTransition } from "@/components/PageTransition";
import { Toast } from "@/components/Toast";
import { ProgressBar } from "@/components/ProgressBar";
import { TickerTape } from "@/components/TickerTape";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "CURRENCY — See the world move",
  description: "Global currency and crypto intelligence: convert, compare, and analyze exchange rates with real-time data."
};

const NO_FLASH = `(function(){try{var s=localStorage.getItem('currency-theme');var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body>
        <ProgressBar />
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <TickerTape />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
              <PageTransition>{children}</PageTransition>
            </main>
            <footer className="border-t border-hairline dark:border-hairline-night px-6 py-5">
              <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-semibold tracking-tight">
                    CU<span className="text-amber dark:text-amber-bright">₹₹€</span>NC<span className="text-amber dark:text-amber-bright">¥</span>
                  </span>
                  <span className="text-xs text-ink-muted dark:text-ink-onnightMuted font-mono">·</span>
                  <span className="text-xs text-ink-muted dark:text-ink-onnightMuted font-mono">FX: Frankfurter (ECB) · Crypto: CoinGecko</span>
                </div>
                <span className="text-xs text-ink-muted dark:text-ink-onnightMuted font-mono">Informational only — not investment advice.</span>
              </div>
            </footer>
          </div>
          <Toast />
        </ThemeProvider>
      </body>
    </html>
  );
}
