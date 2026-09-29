import { PURCHASE_FEES_RATE } from "@/constants/houses";

/** Precio + honorarios (15%) = costo estimado de adquirir la propiedad. */
export function purchaseCost(price) {
    if (!price || price <= 0) {
        return null;
    }
    const fees = price * PURCHASE_FEES_RATE;
    return { price, fees, total: price + fees };
}

/** Precio (sin honorarios, como se compara en el mercado) dividido por los m². */
export function pricePerSquareMeter(price, area) {
    if (!price || price <= 0 || !area || area <= 0) {
        return null;
    }
    return price / area;
}

/** Cuánto se aleja la oferta del precio publicado (en % y en costo total con honorarios). */
export function compareOffer(askingPrice, offerPrice) {
    const asking = purchaseCost(askingPrice);
    const offer = purchaseCost(offerPrice);
    if (!asking || !offer) {
        return null;
    }
    return {
        diffPercent: ((offer.price - asking.price) / asking.price) * 100,
        totalDifference: asking.total - offer.total,
    };
}
