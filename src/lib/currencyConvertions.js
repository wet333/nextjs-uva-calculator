import { getDollarPrice, getUvaPrice } from "@/lib/currencies";

export function arsToUsd(amount) {
  const dollarPrice = getDollarPrice();
  if (!dollarPrice || dollarPrice <= 0) {
    throw new Error("Invalid dollarPrice provided");
  }
  return amount / dollarPrice;
}

export function arsToUva(amount) {
  const uvaPrice = getUvaPrice();
  if (!uvaPrice || uvaPrice <= 0) {
    throw new Error("Invalid uvaPrice provided");
  }
  return amount / uvaPrice;
}

export function usdToArs(amount) {
  const dollarPrice = getDollarPrice();
  if (!dollarPrice || dollarPrice <= 0) {
    throw new Error("Invalid dollar price provided");
  }
  return amount * dollarPrice;
}

export function usdToUva(amount) {
  const dollarPrice = getDollarPrice();
  const uvaPrice = getUvaPrice();
  if (!dollarPrice || dollarPrice <= 0 || !uvaPrice || uvaPrice <= 0) {
    throw new Error("Invalid conversion prices provided");
  }
  return (amount * dollarPrice) / uvaPrice;
}

export function uvaToArs(amount) {
  const uvaPrice = getUvaPrice();
  if (!uvaPrice || uvaPrice <= 0) {
    throw new Error("Invalid UVA price provided");
  }
  return amount * uvaPrice;
}

export function uvaToUsd(amount) {
  const dollarPrice = getDollarPrice();
  const uvaPrice = getUvaPrice();
  if (!uvaPrice || uvaPrice <= 0 || !dollarPrice || dollarPrice <= 0) {
    throw new Error("Invalid conversion prices provided");
  }
  return (amount * uvaPrice) / dollarPrice;
}
