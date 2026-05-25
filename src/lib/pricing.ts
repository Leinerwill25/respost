import type { PriceBreakdown } from "@/types";

// ================================================
// MÉTODO 1: PORCENTAJE
// ================================================
export function calculatePriceByPercentage(params: {
  materialsCostUsd: number;
  costProductionPct: number; // default: 50
  profitPct: number; // default: 50
  taxPct: number; // default: 0
  portions: number;
}): PriceBreakdown {
  const {
    materialsCostUsd,
    costProductionPct,
    profitPct,
    taxPct,
    portions,
  } = params;

  const productionCostUsd = materialsCostUsd * (costProductionPct / 100);
  const subtotalUsd = materialsCostUsd + productionCostUsd;
  const profitUsd = subtotalUsd * (profitPct / 100);
  const totalBeforeTax = subtotalUsd + profitUsd;
  const taxUsd = totalBeforeTax * (taxPct / 100);
  const salePriceUsd = totalBeforeTax + taxUsd;
  const safePortions = portions > 0 ? portions : 1;
  const pricePerPortionUsd = salePriceUsd / safePortions;

  return {
    materialsCostUsd,
    productionCostUsd,
    profitUsd,
    subtotalUsd,
    taxUsd,
    salePriceUsd,
    pricePerPortionUsd,
  };
}

// ================================================
// MÉTODO 2: PRECIO FIJO
// ================================================
export function calculatePriceByFixed(params: {
  materialsCostUsd: number;
  fixedCostUsd: number; // costo de producción fijo
  fixedProfitUsd: number; // ganancia fija
  taxPct: number;
  portions: number;
}): PriceBreakdown {
  const {
    materialsCostUsd,
    fixedCostUsd,
    fixedProfitUsd,
    taxPct,
    portions,
  } = params;

  const productionCostUsd = fixedCostUsd;
  const subtotalUsd = materialsCostUsd + productionCostUsd;
  const profitUsd = fixedProfitUsd;
  const totalBeforeTax = subtotalUsd + profitUsd;
  const taxUsd = totalBeforeTax * (taxPct / 100);
  const salePriceUsd = totalBeforeTax + taxUsd;
  const safePortions = portions > 0 ? portions : 1;
  const pricePerPortionUsd = salePriceUsd / safePortions;

  return {
    materialsCostUsd,
    productionCostUsd,
    profitUsd,
    subtotalUsd,
    taxUsd,
    salePriceUsd,
    pricePerPortionUsd,
  };
}

// ================================================
// MÉTODO 3: MULTIPLICACIÓN
// ================================================
export function calculatePriceByMultiplication(params: {
  materialsCostUsd: number;
  costMultiplier: number; // ej: 3 → precio = 3× el costo
  taxPct: number;
  portions: number;
}): PriceBreakdown {
  const { materialsCostUsd, costMultiplier, taxPct, portions } = params;

  const basePrice = materialsCostUsd * costMultiplier;
  const productionCostUsd = basePrice - materialsCostUsd; // diferencia
  const profitUsd = 0; // no hay desglose separado en este método
  const subtotalUsd = basePrice;
  const taxUsd = basePrice * (taxPct / 100);
  const salePriceUsd = basePrice + taxUsd;
  const safePortions = portions > 0 ? portions : 1;
  const pricePerPortionUsd = salePriceUsd / safePortions;

  return {
    materialsCostUsd,
    productionCostUsd,
    profitUsd,
    subtotalUsd,
    taxUsd,
    salePriceUsd,
    pricePerPortionUsd,
  };
}

// ================================================
// DISPATCHER UNIFICADO
// ================================================
export function calculatePrice(
  method: "percentage" | "fixed" | "multiplication",
  params: {
    materialsCostUsd: number;
    portions: number;
    taxPct?: number;
    // Porcentaje
    costProductionPct?: number;
    profitPct?: number;
    // Fijo
    fixedCostUsd?: number;
    fixedProfitUsd?: number;
    // Multiplicación
    costMultiplier?: number;
  }
): PriceBreakdown {
  const taxPct = params.taxPct ?? 0;

  switch (method) {
    case "percentage":
      return calculatePriceByPercentage({
        materialsCostUsd: params.materialsCostUsd,
        costProductionPct: params.costProductionPct ?? 50,
        profitPct: params.profitPct ?? 50,
        taxPct,
        portions: params.portions,
      });
    case "fixed":
      return calculatePriceByFixed({
        materialsCostUsd: params.materialsCostUsd,
        fixedCostUsd: params.fixedCostUsd ?? 0,
        fixedProfitUsd: params.fixedProfitUsd ?? 0,
        taxPct,
        portions: params.portions,
      });
    case "multiplication":
      return calculatePriceByMultiplication({
        materialsCostUsd: params.materialsCostUsd,
        costMultiplier: params.costMultiplier ?? 2,
        taxPct,
        portions: params.portions,
      });
  }
}

// ================================================
// CALCULAR COSTO DE MATERIALES DESDE INGREDIENTES
// ================================================
export function calculateMaterialsCost(
  ingredients: Array<{
    quantity: number; // cantidad usada en la receta
    price_usd: number; // precio del paquete
    package_size: number; // tamaño del paquete
  }>
): number {
  return ingredients.reduce((total, ing) => {
    const unitPrice = ing.price_usd / ing.package_size;
    return total + unitPrice * ing.quantity;
  }, 0);
}
