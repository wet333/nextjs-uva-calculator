export function Footer() {
    return (
        <footer className="mt-auto border-t border-white/[0.04]">
            <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
                <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
                    HomeHunt es una herramienta informativa para acompañarte en la compra de una
                    propiedad. Las simulaciones y los cálculos son estimaciones basadas en
                    condiciones publicadas y cotizaciones del día: no constituyen oferta crediticia,
                    asesoramiento financiero o inmobiliario, ni garantía de aprobación por parte de
                    ninguna entidad bancaria. Los datos de Mis casas se guardan solo en tu
                    navegador.
                </p>
                <div className="mt-5 flex flex-col gap-1 text-xs text-muted-foreground/80 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        HomeHunt · Creado por Agustin Wet &copy;{" "}
                        <span suppressHydrationWarning>{new Date().getFullYear()}</span>
                    </p>
                    <p>Fuentes: sitios oficiales de bancos · DolarAPI · BCRA · OpenStreetMap</p>
                </div>
            </div>
        </footer>
    );
}
