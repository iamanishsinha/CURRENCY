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

// Prevent theme flash before React hydrates
const NO_FLASH = `(function(){try{var s=localStorage.getItem('currency-theme');var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>

      <body>
        <ThemeProvider>
          <ProgressBar />
          <Header />
          <TickerTape />
          <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Toast />
        </ThemeProvider>
      </body>
    </html>
  );
}

