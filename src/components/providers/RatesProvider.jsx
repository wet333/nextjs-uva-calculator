"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchRates, getDollarPrice, getUvaPrice, getRatesMeta } from "@/lib/currencies";

const RatesContext = createContext(null);

export function RatesProvider({ children }) {
    const [dollarPrice, setDollarPrice] = useState(null);
    const [uvaPrice, setUvaPrice] = useState(null);
    const [ratesMeta, setRatesMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadRates = async () => {
            setLoading(true);
            setError(null);
            try {
                await fetchRates();
                if (cancelled) return;
                setDollarPrice(getDollarPrice());
                setUvaPrice(getUvaPrice());
                setRatesMeta(getRatesMeta());
            } catch (err) {
                console.error("Error fetching rates:", err);
                if (cancelled) return;
                setDollarPrice(null);
                setUvaPrice(null);
                setRatesMeta(null);
                setError(
                    "No se pudieron cargar las cotizaciones del dólar MEP y la UVA. Recargá la página e intentá de nuevo."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadRates();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <RatesContext.Provider
            value={{
                dollarPrice,
                uvaPrice,
                ratesMeta,
                loading,
                error,
                ready: !loading && dollarPrice != null && uvaPrice != null,
            }}
        >
            {children}
        </RatesContext.Provider>
    );
}

export function useRates() {
    const context = useContext(RatesContext);
    if (!context) {
        throw new Error("useRates debe usarse dentro de RatesProvider");
    }
    return context;
}
