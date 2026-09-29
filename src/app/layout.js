import { IBM_Plex_Sans, Plus_Jakarta_Sans } from "next/font/google";
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

// Solo para el wordmark "HomeHunt": un único peso para no sumar carga a la página.
const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["800"],
    variable: "--font-display",
    display: "swap",
});

export const metadata = {
    applicationName: "HomeHunt",
    title: {
        default: "HomeHunt · Tu ayuda para comprar casa",
        template: "%s · HomeHunt",
    },
    description:
        "HomeHunt te acompaña en la compra de tu casa: simulá tu crédito hipotecario UVA, compará bancos de Argentina y seguí las propiedades que te interesan con precios, ubicación y notas.",
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="es"
            className={`dark ${ibmPlexSans.variable} ${plusJakartaSans.variable}`}
            suppressHydrationWarning
        >
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
