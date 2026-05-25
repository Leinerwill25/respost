// ================================================
// FORMATEO DE MONEDAS
// ================================================

/**
 * Formatea un número como precio en USD
 * Ej: 12.5 → "$12.50 USD"
 */
export function formatUSD(
  amount: number,
  options: { showLabel?: boolean; decimals?: number } = {}
): string {
  const { showLabel = true, decimals = 2 } = options;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  return showLabel ? `$${formatted} USD` : `$${formatted}`;
}

/**
 * Formatea un número como precio en Bolívares
 * Ej: 601.25 → "Bs. 601,25"
 */
export function formatBs(
  amount: number,
  options: { decimals?: number } = {}
): string {
  const { decimals = 2 } = options;
  const formatted = new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  return `Bs. ${formatted}`;
}

/**
 * Convierte USD a Bolívares usando la tasa EUR del BCV
 * Nota: en Venezuela la tasa de referencia es EUR/Bs
 * price_bs = price_usd * euro_rate
 */
export function convertToBs(usd: number, euroRate: number): number {
  return usd * euroRate;
}

/**
 * Formatea una cantidad de unidad de insumo con equivalencia
 * Ej: 1500g → "1,500 g (1.5 kg)"
 */
export function formatIngredientQuantity(
  quantity: number,
  unit: "g" | "kg" | "ml" | "l" | "unidades"
): string {
  const formatted = new Intl.NumberFormat("es-VE").format(quantity);

  if (unit === "g" && quantity >= 1000) {
    return `${formatted} g (${(quantity / 1000).toFixed(2)} kg)`;
  }
  if (unit === "ml" && quantity >= 1000) {
    return `${formatted} ml (${(quantity / 1000).toFixed(2)} l)`;
  }
  return `${formatted} ${unit}`;
}

/**
 * Formatea una fecha relativa (hoy, ayer, hace X días)
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "hace menos de 1 hora";
  if (diffHours < 24) return `hoy ${date.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return "ayer";
  if (diffDays < 7) return `hace ${diffDays} días`;

  return date.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Calcula si una tasa tiene más de N horas sin actualizar
 */
export function isRateStale(rateDatetime: string, hoursThreshold = 2): boolean {
  const rateDate = new Date(rateDatetime);
  const now = new Date();
  const diffHours = (now.getTime() - rateDate.getTime()) / (1000 * 60 * 60);
  return diffHours > hoursThreshold;
}
