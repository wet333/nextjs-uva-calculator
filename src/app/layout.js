import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/blocks/Header";
import Footer from "@/components/blocks/Footer";
import { RatesProvider } from "@/contexts/RatesContext";

export const metadata = {
    title: "Simulador UVA Hipotecarios",
    description:
        "Simulador de Créditos Hipotecarios UVA en Argentina, con condiciones oficiales de diferentes bancos del país",
};

export default function RootLayout({ children }) {
    return (
        <html lang="es" className="dark" suppressHydrationWarning>
            <head>
                <meta name="theme-color" content="#0a0e17" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
            </head>
            <body className="flex min-h-screen flex-col">
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
                            className="flex-grow px-4 py-6 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6 lg:px-8"
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
