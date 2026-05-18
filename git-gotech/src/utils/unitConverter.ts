export type WeightUnit = "mg" | "g" | "kg" | "lb" | "oz";

const PRICE_PER_KG = parseInt(process.env.KGToUsd as string) || 0;

export const calculateWeightPrice = (
  amount: number,
  unit: WeightUnit,
): { weightInKg: number; totalPrice: number } => {
  const conversionRates: Record<WeightUnit, number> = {
    mg: 0.000001,
    g: 0.001,
    kg: 1,
    lb: 0.453592,
    oz: 0.0283495,
  };
  const weightInKg = amount * conversionRates[unit];
  const totalPrice = weightInKg * PRICE_PER_KG;

  return {
    weightInKg: Number(weightInKg.toFixed(3)),
    totalPrice: Number(totalPrice.toFixed(2)),
  };
};
