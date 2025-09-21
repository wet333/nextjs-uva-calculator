let dollarPrice = 0;
let uvaPrice = 1252.2;

export async function fetchDollarPrice() {
  try {
    const response = await fetch("https://dolarapi.com/v1/dolares/bolsa");
    if (!response.ok) {
      throw new Error("Failed to fetch dollar price");
    }
    const data = await response.json();
    dollarPrice = data.venta;
  } catch (error) {
    console.error("Error fetching dollar price:", error);
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
