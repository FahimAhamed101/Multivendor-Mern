/** USD per km (distance component) */
export const RATE_PER_KM = 2;
/** USD per kg of product weight (shipping weight component) */
export const RATE_PER_KG = 2;
/** Minimum charge for the distance component only */
export const MIN_DISTANCE_DELIVERY = 5;
/** Fallback distance charge when map / coordinates are not ready yet */
export const FALLBACK_DISTANCE_DELIVERY_USD = 20;

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Distance-only delivery (USD): max(min, km × rate).
 * Caller adds weight charge separately.
 */
export function calcDistanceDeliveryUsd(
  customerLat: number,
  customerLon: number,
  showroomLng: number,
  showroomLat: number,
): number {
  const distKm = haversineKm(customerLat, customerLon, showroomLat, showroomLng);
  return Math.max(
    MIN_DISTANCE_DELIVERY,
    parseFloat((distKm * RATE_PER_KM).toFixed(2)),
  );
}

export type ProductWeightLike = {
  amount?: number;
  unit?: string;
} | null | undefined;

/** Normalise API `product_weight` to kilograms for one product unit. */
export function productWeightToKg(weight: ProductWeightLike): number {
  if (!weight || typeof weight.amount !== "number" || !Number.isFinite(weight.amount)) {
    return 0;
  }
  const u = (weight.unit || "kg").toLowerCase();
  if (u === "kg" || u === "kgs") return Math.max(0, weight.amount);
  if (u === "lb" || u === "lbs") return Math.max(0, weight.amount * 0.453592);
  if (u === "g" || u === "gram" || u === "grams") return Math.max(0, weight.amount / 1000);
  return Math.max(0, weight.amount);
}

/** Weight-based delivery: sum over lines (kg × qty × rate). */
export function calcWeightDeliveryUsdForItems(
  items: Array<{
    product?: { product_weight?: ProductWeightLike };
    quantity?: number;
  }>,
): number {
  const raw = items.reduce((sum, item) => {
    const kg = productWeightToKg(item.product?.product_weight ?? null);
    const qty = item.quantity ?? 1;
    return sum + kg * qty * RATE_PER_KG;
  }, 0);
  return parseFloat(raw.toFixed(2));
}
