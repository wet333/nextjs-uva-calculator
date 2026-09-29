import Link from "next/link";
import { House, Link2, MapPin, Ruler, StickyNote } from "lucide-react";
import { RemoteImage } from "@/components/houses/RemoteImage";
import { getHouseCoverImage, getHouseDisplayName, getHouseMapsUrl } from "@/lib/houses/house-model";
import { getPortal } from "@/lib/houses/listing-url";
import { purchaseCost } from "@/lib/houses/purchase-cost";
import { cn, formatArs, formatShortDate, formatThousandsDisplay, formatUsd } from "@/lib/utils";

/** "300 m² terreno · 120 m² cubiertos", o solo lo que esté cargado. */
function formatAreas(house) {
    const parts = [];
    if (house.landArea) parts.push(`${formatThousandsDisplay(house.landArea)} m² terreno`);
    if (house.coveredArea) parts.push(`${formatThousandsDisplay(house.coveredArea)} m² cubiertos`);
    return parts.join(" · ");
}

function PriceStat({ label, price, format }) {
    const cost = purchaseCost(price);

    return (
        <div className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums text-foreground">
                {cost ? format(cost.price) : "—"}
            </dd>
            {cost ? (
                <dd className="truncate text-[11px] tabular-nums text-muted-foreground">
                    {format(cost.total)} c/ honorarios
                </dd>
            ) : null}
        </div>
    );
}

function Count({ icon: Icon, value, label, className }) {
    return (
        <span className={cn("inline-flex items-center gap-1 tabular-nums", className)}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {value}
            <span className="sr-only">{label}</span>
        </span>
    );
}

export function HouseCard({ house }) {
    const cover = getHouseCoverImage(house);
    const format = house.currency === "USD" ? formatUsd : formatArs;
    const portals = [...new Set(house.links.map((link) => getPortal(link.url).name))];

    const placeholder = (
        <div className="flex h-full w-full items-center justify-center">
            <House className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
        </div>
    );

    const name = getHouseDisplayName(house);
    const mapsUrl = getHouseMapsUrl(house);
    const areas = formatAreas(house);

    // La tarjeta entera es clickeable con el ::after del link del título ("stretched link"),
    // así el botón de mapa puede ser otro link sin anidar <a> dentro de <a>.
    return (
        <article className="surface-panel group relative flex w-full min-w-0 flex-col overflow-hidden transition-[box-shadow,background-color] duration-150 hover:bg-card/70 hover:ring-white/[0.1]">
            <div className="relative aspect-[16/9] overflow-hidden bg-white/[0.02]">
                <RemoteImage
                    src={cover}
                    className="transition-transform duration-300 group-hover:scale-[1.02]"
                    fallback={placeholder}
                />
                {mapsUrl ? (
                    <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ver ${name} en el mapa`}
                        title="Abrir ubicación"
                        className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-[11px] font-medium text-foreground ring-1 ring-white/[0.1] backdrop-blur transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                        <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        Mapa
                    </a>
                ) : null}
                {portals.length > 0 ? (
                    <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                        {portals.slice(0, 3).map((portal) => (
                            <span
                                key={portal}
                                className="rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground/90 ring-1 ring-white/[0.08] backdrop-blur"
                            >
                                {portal}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="min-w-0">
                    <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground">
                        <Link
                            href={`/casas/${house.id}`}
                            className="after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-primary/40"
                        >
                            {name}
                        </Link>
                    </h3>
                    {house.address ? (
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                            <span className="truncate">{house.address}</span>
                        </p>
                    ) : null}
                    {areas ? (
                        <p className="mt-1 flex items-center gap-1 truncate text-xs tabular-nums text-muted-foreground">
                            <Ruler className="h-3 w-3 shrink-0" aria-hidden="true" />
                            <span className="truncate">{areas}</span>
                        </p>
                    ) : null}
                </div>
                <dl className="grid grid-cols-2 gap-3">
                    <PriceStat label="Publicado" price={house.askingPrice} format={format} />
                    <PriceStat label="Mi oferta" price={house.offerPrice} format={format} />
                </dl>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.05] pt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <Count icon={Link2} value={house.links.length} label="links" />
                        <Count icon={StickyNote} value={house.notes.length} label="notas" />
                    </div>
                    <span className="shrink-0 text-[11px]">{formatShortDate(house.updatedAt)}</span>
                </div>
            </div>
        </article>
    );
}
