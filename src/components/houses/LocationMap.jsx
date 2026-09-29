import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// Medio lado del recuadro pedido al embed, en grados (~300 m de alto).
const LAT_SPAN = 0.0028;
const LNG_SPAN = 0.0055;

function embedUrl({ lat, lng }) {
    const bbox = [lng - LNG_SPAN, lat - LAT_SPAN, lng + LNG_SPAN, lat + LAT_SPAN].join(",");
    const params = new URLSearchParams({ bbox, layer: "mapnik", marker: `${lat},${lng}` });
    return `https://www.openstreetmap.org/export/embed.html?${params}`;
}

/**
 * Mapa de OpenStreetMap (embed público, sin API key) con el pin de la casa. No se puede
 * arrastrar: todo el recuadro es un link que abre la ubicación en Google Maps.
 * El iframe es 72px más grande por lado para dejar afuera los controles de zoom y la
 * atribución del embed (el pin sigue centrado); la atribución se muestra aparte, más chica.
 */
export function LocationMap({ coordinates, href, className }) {
    return (
        <div
            className={cn(
                "group/map relative overflow-hidden rounded-lg bg-white/[0.03] ring-1 ring-white/[0.08] transition-[box-shadow] hover:ring-white/[0.16]",
                className
            )}
        >
            <iframe
                src={embedUrl(coordinates)}
                title="Mapa de la ubicación"
                loading="lazy"
                tabIndex={-1}
                aria-hidden="true"
                className="pointer-events-none absolute left-[-72px] top-[-72px] h-[calc(100%+144px)] w-[calc(100%+144px)] border-0 transition-[filter] duration-200 [filter:invert(0.9)_hue-rotate(180deg)_saturate(0.7)_brightness(0.9)] group-hover/map:[filter:invert(0.9)_hue-rotate(180deg)_saturate(0.8)_brightness(1)]"
            />
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir la ubicación en Google Maps"
                className="absolute inset-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60"
            >
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-background/85 px-2 py-1 text-[11px] font-medium text-foreground ring-1 ring-white/[0.1] backdrop-blur transition-colors group-hover/map:bg-background">
                    Google Maps
                    <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
                </span>
            </a>
            <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-1 right-1 rounded bg-background/75 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
                © OpenStreetMap
            </a>
        </div>
    );
}
