import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RatesProvider } from "@/components/providers/RatesProvider";

const ibmPlexSans = IBM_Plex_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    style: ["normal", "italic"],
    variable: "--font-sans",
    display: "swap",
});

export const metadata = {
    title: "Simulador UVA Hipotecarios",
    description:
        "Simulador de Créditos Hipotecarios UVA en Argentina, con condiciones oficiales de diferentes bancos del país",
};

export default function RootLayout({ children }) {
    return (
        <html lang="es" className={`dark ${ibmPlexSans.variable}`} suppressHydrationWarning>
            <head>
                <meta name="theme-color" content="#0c0f14" />
            </head>
            <body className={`${ibmPlexSans.className} flex min-h-screen flex-col`}>
                <RatesProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        forcedTheme="dark"
                        enableSystem={false}
                        disableTransitionOnChange
                    >
                        <a href="#main-content" className="skip-link">
                            Saltar al contenido
                        </a>
                        <Header />
                        <main
                            id="main-content"
                            tabIndex={-1}
                            className="flex-grow px-4 py-8 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6 sm:py-10 lg:px-8"
                        >
                            {children}
                        </main>
                        <Footer />
                    </ThemeProvider>
                </RatesProvider>
            </body>
        </html>
    );
}
