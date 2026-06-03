let dollarPrice = 0;
let uvaPrice = 0;
let dollarUpdatedAt = null;
let uvaUpdatedAt = null;

export async function fetchDollarPrice() {
    try {
        const response = await fetch("https://dolarapi.com/v1/dolares/bolsa");
        if (!response.ok) {
            throw new Error("Failed to fetch dollar price");
        }
        const data = await response.json();
        dollarPrice = data.venta;
        dollarUpdatedAt = data.fechaActualizacion ?? null;
    } catch (error) {
        console.error("Error fetching dollar price:", error);
        dollarPrice = 0;
        dollarUpdatedAt = null;
        throw error;
    }
}

export async function fetchUvaPrice() {
    try {
        const response = await fetch(
            "https://api.argentinadatos.com/v1/finanzas/indices/uva"
        );
        if (!response.ok) {
            throw new Error("Failed to fetch UVA price");
        }
        const data = await response.json();
        const latest = data[data.length - 1];
        if (!latest?.valor) {
            throw new Error("Invalid UVA series response");
        }
        uvaPrice = latest.valor;
        uvaUpdatedAt = latest.fecha ?? null;
    } catch (error) {
        console.error("Error fetching UVA price:", error);
        uvaPrice = 0;
        uvaUpdatedAt = null;
        throw error;
    }
}

export async function fetchRates() {
    const results = await Promise.allSettled([
        fetchDollarPrice(),
        fetchUvaPrice(),
    ]);
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length === results.length) {
        throw new Error("Failed to fetch exchange rates");
    }
    if (results[0].status === "rejected") {
        throw results[0].reason;
    }
    if (results[1].status === "rejected") {
        throw results[1].reason;
    }
}

export function getDollarPrice() {
    if (dollarPrice === 0) {
        throw new Error("Invalid Dollar(U$D) Price provided.");
    }
    return dollarPrice;
}

export function getUvaPrice() {
    if (!uvaPrice || uvaPrice <= 0) {
        throw new Error("Invalid UVA price provided");
    }
    return uvaPrice;
}

export function getRatesMeta() {
    return {
        dollarUpdatedAt,
        uvaUpdatedAt,
    };
}
