"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { House } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HouseDetail } from "@/components/houses/HouseDetail";
import { useHouses } from "@/components/providers/HousesProvider";

function DetailSkeleton() {
    return (
        <div className="space-y-6" aria-hidden="true">
            <div className="h-9 w-32 animate-pulse rounded-lg bg-white/[0.04]" />
            <div className="surface-panel space-y-3 p-6">
                <div className="h-7 w-1/2 animate-pulse rounded bg-white/[0.05]" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-white/[0.04]" />
            </div>
            <div className="grid gap-6 lg:grid-cols-12">
                <div className="surface-panel h-64 animate-pulse lg:col-span-7" />
                <div className="surface-panel h-64 animate-pulse lg:col-span-5" />
            </div>
        </div>
    );
}

export default function HouseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { hydrated, houses, deleteHouse } = useHouses();
    const [removedId, setRemovedId] = useState(null);

    const house = houses.find((item) => item.id === id);

    if (!hydrated || removedId === id) {
        return <DetailSkeleton />;
    }

    if (!house) {
        return (
            <div className="surface-panel flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.03] ring-1 ring-white/[0.06]">
                    <House className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                    <h2 className="section-heading">No encontramos esta casa</h2>
                    <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
                        Puede que se haya eliminado o que esté guardada en otro navegador. Si tenés
                        un respaldo, importalo desde Mis casas.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/casas">Volver a Mis casas</Link>
                </Button>
            </div>
        );
    }

    return (
        <HouseDetail
            house={house}
            onDelete={() => {
                setRemovedId(house.id);
                deleteHouse(house.id);
                router.replace("/casas");
            }}
        />
    );
}
