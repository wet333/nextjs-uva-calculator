"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { HOUSES_STORAGE_KEY } from "@/constants/houses";
import { buildHouse } from "@/lib/houses/house-model";
import { mergeHouses, readHousesStore, writeHousesStore } from "@/lib/houses/houses-storage";

const HousesContext = createContext(null);

const STORAGE_ERROR_MESSAGE =
    "No se pudieron guardar los cambios en este navegador (almacenamiento bloqueado o lleno). Exportá un respaldo para no perderlos.";

function nowIso() {
    return new Date().toISOString();
}

/**
 * Estado de "Mis casas". La fuente de verdad es localStorage: se lee al montar, se escribe
 * en cada cambio y se sincroniza entre pestañas con el evento `storage`.
 */
export function HousesProvider({ children }) {
    // null = todavía no se leyó localStorage (SSR / primer render).
    const [store, setStore] = useState(null);
    const [storageError, setStorageError] = useState(null);

    useEffect(() => {
        setStore(readHousesStore());

        const onStorage = (event) => {
            if (event.key === HOUSES_STORAGE_KEY) {
                setStore(readHousesStore());
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    useEffect(() => {
        if (!store) {
            return;
        }
        try {
            writeHousesStore(store);
            setStorageError(null);
        } catch (error) {
            console.error("Error guardando casas:", error);
            setStorageError(STORAGE_ERROR_MESSAGE);
        }
    }, [store]);

    const commitHouses = useCallback((recipe) => {
        setStore((prev) =>
            prev ? { ...prev, houses: recipe(prev.houses), updatedAt: nowIso() } : prev
        );
    }, []);

    const createHouse = useCallback(
        (fields) => {
            const house = buildHouse(fields);
            commitHouses((houses) => [house, ...houses]);
            return house.id;
        },
        [commitHouses]
    );

    /** `recipe` recibe la casa y devuelve la nueva versión (ver helpers de house-model). */
    const updateHouse = useCallback(
        (id, recipe) => {
            commitHouses((houses) =>
                houses.map((house) => {
                    if (house.id !== id) {
                        return house;
                    }
                    const next = recipe(house);
                    return next === house ? house : { ...next, updatedAt: nowIso() };
                })
            );
        },
        [commitHouses]
    );

    const deleteHouse = useCallback(
        (id) => {
            commitHouses((houses) => houses.filter((house) => house.id !== id));
        },
        [commitHouses]
    );

    const importHouses = useCallback(
        (imported) => {
            const { houses, result } = mergeHouses(store?.houses ?? [], imported);
            if (result.added > 0 || result.updated > 0) {
                commitHouses(() => houses);
            }
            return result;
        },
        [store, commitHouses]
    );

    const markExported = useCallback((exportedAt) => {
        setStore((prev) => (prev ? { ...prev, lastExportedAt: exportedAt } : prev));
    }, []);

    const value = useMemo(
        () => ({
            hydrated: store != null,
            houses: store?.houses ?? [],
            updatedAt: store?.updatedAt ?? null,
            lastExportedAt: store?.lastExportedAt ?? null,
            storageError,
            createHouse,
            updateHouse,
            deleteHouse,
            importHouses,
            markExported,
        }),
        [store, storageError, createHouse, updateHouse, deleteHouse, importHouses, markExported]
    );

    return <HousesContext.Provider value={value}>{children}</HousesContext.Provider>;
}

export function useHouses() {
    const context = useContext(HousesContext);
    if (!context) {
        throw new Error("useHouses debe usarse dentro de HousesProvider");
    }
    return context;
}
