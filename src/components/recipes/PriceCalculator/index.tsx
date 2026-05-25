"use client";

import { DollarSign } from "lucide-react";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { formatUSD, convertToBs, formatBs } from "@/lib/currency";
import { MethodPercentage } from "./MethodPercentage";
import { MethodFixed } from "./MethodFixed";
import { MethodMultiplication } from "./MethodMultiplication";
import type { PriceBreakdown, PricingMethod } from "@/types";

interface PriceCalculatorProps {
  materialsCostUsd: number;
  portions: number;
  euroRate: number;
  pricingMethod: PricingMethod;
  onMethodChange: (method: PricingMethod) => void;
  onChange: (breakdown: PriceBreakdown) => void;
  initialValues?: {
    // Percentage
    costProductionPct?: number;
    profitPct?: number;
    // Fixed
    fixedCostUsd?: number;
    fixedProfitUsd?: number;
    // Multiplication
    costMultiplier?: number;
    // Shared
    taxPct?: number;
  };
  layout?: "sidebar" | "full";
}

const TABS: { id: PricingMethod; label: string }[] = [
  { id: "percentage", label: "Porcentaje" },
  { id: "fixed", label: "Precio Fijo" },
  { id: "multiplication", label: "Multiplicación" },
];

export function PriceCalculator({
  materialsCostUsd,
  portions,
  euroRate,
  pricingMethod,
  onMethodChange,
  onChange,
  initialValues,
  layout = "full",
}: PriceCalculatorProps) {
  const bsMaterialsCost = convertToBs(materialsCostUsd, euroRate);

  return (
    <div className="space-y-4">
      {/* Info card: total materials cost */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-[var(--bg-muted)] border border-[var(--border-default)] rounded-[12px] p-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-[var(--red-100)] rounded-[10px] flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-[var(--red-600)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-0.5 font-sans">
              Costo total de materiales
            </p>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-bold text-[var(--text-heading)] text-base font-display">
                {formatUSD(materialsCostUsd)}
              </span>
              <span className="text-[var(--text-muted)] text-xs font-sans">
                {formatBs(bsMaterialsCost)}
              </span>
            </div>
          </div>
        </div>
        <div className="border-t sm:border-t-0 sm:border-l border-[var(--border-default)] pt-2.5 sm:pt-0 sm:pl-4 flex sm:flex-col justify-between items-center sm:items-end shrink-0">
          <p className="text-xs text-[var(--text-muted)] sm:mb-0.5 font-sans">Porciones</p>
          <p className="font-semibold text-[var(--text-heading)] text-sm sm:text-base font-sans">{portions}</p>
        </div>
      </div>

      {/* Method tabs */}
      <div className="flex gap-1 bg-[var(--bg-muted)] rounded-[10px] p-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onMethodChange(tab.id)}
            className={`
              flex-1 py-2 rounded-[8px] font-semibold transition-all duration-200 whitespace-nowrap shrink-0 md:shrink
              ${layout === "sidebar" ? "text-[11px] px-1.5" : "text-xs sm:text-sm px-1 sm:px-3"}
              ${
                pricingMethod === tab.id
                  ? "bg-white text-[var(--red-600)] shadow-sm border border-[var(--border-default)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-heading)]"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Method content */}
      <div>
        {pricingMethod === "percentage" && (
          <MethodPercentage
            materialsCostUsd={materialsCostUsd}
            portions={portions}
            euroRate={euroRate}
            onChange={onChange}
            initialValues={initialValues}
            layout={layout}
          />
        )}
        {pricingMethod === "fixed" && (
          <MethodFixed
            materialsCostUsd={materialsCostUsd}
            portions={portions}
            euroRate={euroRate}
            onChange={onChange}
            initialValues={initialValues}
            layout={layout}
          />
        )}
        {pricingMethod === "multiplication" && (
          <MethodMultiplication
            materialsCostUsd={materialsCostUsd}
            portions={portions}
            euroRate={euroRate}
            onChange={onChange}
            initialValues={initialValues}
            layout={layout}
          />
        )}
      </div>
    </div>
  );
}
