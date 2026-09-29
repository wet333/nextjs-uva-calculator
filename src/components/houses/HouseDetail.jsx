"use client";

import { useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EntryList } from "@/components/houses/EntryList";
import { HouseIdentity } from "@/components/houses/HouseIdentity";
import { LinksSection } from "@/components/houses/LinksSection";
import { PriceSection } from "@/components/houses/PriceSection";
import { useHouses } from "@/components/providers/HousesProvider";
import { addEntry, getHouseDisplayName, removeEntry, updateEntry } from "@/lib/houses/house-model";

export function HouseDetail({ house, onDelete }) {
    const { updateHouse } = useHouses();
    const houseId = house.id;

    const update = useCallback((recipe) => updateHouse(houseId, recipe), [updateHouse, houseId]);

    const confirmDelete = () => {
        const name = getHouseDisplayName(house);
        if (
            window.confirm(
                `¿Eliminar "${name}"? Se borran sus links, precios y notas. No se puede deshacer.`
            )
        ) {
            onDelete();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <Button asChild variant="ghost" size="sm" className="-ml-3 px-3">
                    <Link href="/casas">
                        <ArrowLeft aria-hidden="true" />
                        Mis casas
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="-mr-3 px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={confirmDelete}
                >
                    <Trash2 aria-hidden="true" />
                    Eliminar casa
                </Button>
            </div>

            <HouseIdentity house={house} onChange={update} />

            {/*
              Mobile: una columna en orden Precio y superficie → Publicaciones → Notas.
              Desktop: izquierda Publicaciones + Notas, derecha Precio y superficie.
              Las columnas son `contents` en mobile para que `order-*` ordene todo junto.
            */}
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start">
                <div className="contents lg:col-span-7 lg:flex lg:flex-col lg:gap-6">
                    <LinksSection className="order-2" house={house} onChange={update} />
                    <Card className="order-3">
                        <CardHeader>
                            <CardTitle tag="h2">Notas</CardTitle>
                            <CardDescription>
                                Pensamientos, dudas para preguntar y conclusiones. Una por fila.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <EntryList
                                id={`notes-${houseId}`}
                                entries={house.notes}
                                label="Notas"
                                placeholder="Ej. Preguntar si acepta crédito hipotecario…"
                                emptyText="Sin notas todavía."
                                onAdd={(text) =>
                                    update((current) => addEntry(current, "notes", text))
                                }
                                onUpdate={(entryId, text) =>
                                    update((current) =>
                                        updateEntry(current, "notes", entryId, text)
                                    )
                                }
                                onRemove={(entryId) =>
                                    update((current) => removeEntry(current, "notes", entryId))
                                }
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="contents lg:col-span-5 lg:flex lg:flex-col lg:gap-6">
                    <PriceSection className="order-1" house={house} onChange={update} />
                </div>
            </div>
        </div>
    );
}
