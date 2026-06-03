function Footer() {
    return (
        <footer className="mt-auto border-t border-white/[0.04]">
            <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
                <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
                    Esta herramienta es exclusivamente informativa. Los resultados
                    son estimaciones basadas en condiciones publicadas y cotizaciones
                    del día. No constituye oferta crediticia, asesoramiento
                    financiero ni garantía de aprobación por parte de ninguna
                    entidad bancaria.
                </p>
                <div className="mt-5 flex flex-col gap-1 text-xs text-muted-foreground/80 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        Creado por Agustin Wet &copy;{" "}
                        <span suppressHydrationWarning>
                            {new Date().getFullYear()}
                        </span>
                    </p>
                    <p>Fuentes: sitios oficiales de bancos · dolarapi · BCRA</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
