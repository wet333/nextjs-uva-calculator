import localFont from "next/font/local";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import {theme} from "../../tailwind.config";
import {Header} from "@/components/blocks/Header";
import Footer from "@/components/blocks/Footer";

export const metadata = {
    title: "Simulador UVA Hipotecarios",
    description: "Simulador de Créditos Hipotecarios UVA en Argentina, con condiciones oficiales de diferentes bancos del país",
};

export default function RootLayout({ children }) {
  return (
      <html lang="en" suppressHydrationWarning>
      <head>
          <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Noto+Serif:ital,wght@0,100..900;1,100..900&display=swap"
          />
          <title>{metadata.title}</title>
      </head>

      <body
              className={`antialiased flex flex-col min-h-screen bg-slate-950`}
      >
      <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
      >
          <Header/>
          <main className="flex-grow px-6 py-4">
              {children}
          </main>
          <Footer/>
      </ThemeProvider>
      </body>
      </html>
  );
}
