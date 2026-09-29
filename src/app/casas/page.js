"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { House } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HouseCard } from "@/components/houses/HouseCard";
import { HousesBackupBar } from "@/components/houses/HousesBackupBar";
import { NewHouseForm } from "@/components/houses/NewHouseForm";
import { useHouses } from "@/components/providers/HousesProvider";

function HouseGridSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((key) => (
                <div key={key} className="surface-panel overflow-hidden">
                    <div className="aspect-[16/9] animate-pulse bg-white/[0.03]" />
                    <div className="space-y-3 p-4">
                        <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.05]" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function HousesPage() {
    const { hydrated, houses, createHouse } = useHouses();
    const router = useRouter();

    const sortedHouses = useMemo(
        () => [...houses].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        [houses]
    );

    const onCreate = (fields) => {
        const id = createHouse(fields);
        router.push(`/casas/${id}`);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle tag="h2">Mis casas</CardTitle>
                    <CardDescription>
                        Guardá cada propiedad que te interese: publicaciones, ubicación, precio y
                        superficie, y tus notas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-0">
                    <NewHouseForm onCreate={onCreate} disabled={!hydrated} />
                    <HousesBackupBar />
                </CardContent>
            </Card>

            <section aria-labelledby="saved-houses-heading" className="space-y-4">
                <h2
                    id="saved-houses-heading"
                    className="flex items-baseline gap-2 text-sm font-semibold text-foreground"
                >
                    Casas guardadas
                    {hydrated ? (
                        <span className="text-xs font-normal tabular-nums text-muted-foreground">
                            {houses.length}
                        </span>
                    ) : null}
                </h2>
                {!hydrated ? (
                    <HouseGridSkeleton />
                ) : sortedHouses.length === 0 ? (
                    <div className="surface-panel flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.03] ring-1 ring-white/[0.06]">
                            <House className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
                            Todavía no guardaste ninguna casa. Pegá el link de una publicación
                            arriba para empezar, o importá un respaldo.
                        </p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {sortedHouses.map((house) => (
                            <li key={house.id} className="flex min-w-0">
                                <HouseCard house={house} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}
