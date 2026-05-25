"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { calculatePriceByFixed } from "@/lib/pricing";
import type { PriceBreakdown } from "@/types";
import { formatUSD } from "@/lib/currency";

interface MethodFixedProps {
  materialsCostUsd: number;
  portions: number;
  euroRate: number;
  onChange: (breakdown: PriceBreakdown) => void;
  initialValues?: {
    fixedCostUsd?: number;
    fixedProfitUsd?: number;
    taxPct?: number;
  };
  layout?: "sidebar" | "full";
}

export function MethodFixed({
  materialsCostUsd,
  portions,
  euroRate,
  onChange,
  initialValues,
  layout = "full",
}: MethodFixedProps) {
  const [fixedCostUsd, setFixedCostUsd] = useState(
    initialValues?.fixedCostUsd ?? 0
  );
  const [fixedProfitUsd, setFixedProfitUsd] = useState(
    initialValues?.fixedProfitUsd ?? 0
  );
  const [taxPct, setTaxPct] = useState(initialValues?.taxPct ?? 0);

  const calculated = calculatePriceByFixed({
    materialsCostUsd,
    fixedCostUsd,
    fixedProfitUsd,
    taxPct,
    portions,
  });

  const breakdown = {
    ...calculated,
    fixedCostUsd,
    fixedProfitUsd,
    taxPct,
  } as any;

  useEffect(() => {
    onChange(breakdown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialsCostUsd, fixedCostUsd, fixedProfitUsd, taxPct, portions]);

  const isSidebar = layout === "sidebar";

  return (
    <div className="space-y-5">
      {/* Tutorial */}
      <div className="flex gap-3 items-start bg-[var(--info-bg)] border border-[var(--info)]/20 rounded-[var(--radius-md)] p-3">
        <Info className="w-4 h-4 text-[var(--info)] mt-0.5 shrink-0" />
        <p className="text-sm text-[var(--info)] font-medium font-sans">
          Ingresa cuánto te cuesta producir este postre (luz, gas, tu tiempo)
          como monto fijo, y cuánto quieres ganar.
        </p>
      </div>

      {/* Fields */}
      <div className={isSidebar ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 sm:grid-cols-3 gap-4"}>
        <Input
          label="Costo de producción (USD)"
          type="number"
          min={0}
          step={0.01}
          value={fixedCostUsd}
          onChange={(e) => setFixedCostUsd(Number(e.target.value))}
          helperText="Luz, gas, tiempo…"
          leftIcon={<span className="text-xs font-bold">$</span>}
        />
        <Input
          label="Ganancia deseada (USD)"
          type="number"
          min={0}
          step={0.01}
          value={fixedProfitUsd}
          onChange={(e) => setFixedProfitUsd(Number(e.target.value))}
          helperText="Cuánto quieres ganar"
          leftIcon={<span className="text-xs font-bold">$</span>}
        />
        <Input
          label="Impuesto (%)"
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={taxPct}
          onChange={(e) => setTaxPct(Number(e.target.value))}
          helperText="IVA u otro impuesto"
        />
      </div>

      {/* Breakdown table */}
      <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border-default)] overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            <BreakdownRow
              label="Total materiales"
              value={breakdown.materialsCostUsd}
              euroRate={euroRate}
            />
            <BreakdownRow
              label="Costo producción (fijo)"
              value={breakdown.productionCostUsd}
              euroRate={euroRate}
              muted
            />
            <BreakdownRow
              label="Subtotal"
              value={breakdown.subtotalUsd}
              euroRate={euroRate}
              separator
            />
            <BreakdownRow
              label="Ganancia fija"
              value={breakdown.profitUsd}
              euroRate={euroRate}
              muted
            />
            {taxPct > 0 && (
              <BreakdownRow
                label={`Impuesto (${taxPct}%)`}
                value={breakdown.taxUsd}
                euroRate={euroRate}
                muted
              />
            )}
          </tbody>
        </table>

        {/* Sale price highlight */}
        <div className="bg-[var(--red-600)] px-4 py-3.5 flex items-center justify-between">
          <span className="font-display font-bold text-white text-base">
            PRECIO VENTA
          </span>
          <div className="text-right">
            <div className="font-bold text-white text-lg font-display">
              {formatUSD(breakdown.salePriceUsd)}
            </div>
            <div className="text-white/80 text-sm font-sans font-medium">
              Bs.{" "}
              {(breakdown.salePriceUsd * euroRate).toLocaleString("es-VE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        {/* Per portion */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-[var(--border-default)] bg-white/40">
          <span className="text-[var(--text-secondary)] text-sm font-medium">
            Por porción ({portions}{" "}
            {portions === 1 ? "porción" : "porciones"})
          </span>
          <CurrencyDisplay
            amountUsd={breakdown.pricePerPortionUsd}
            euroRate={euroRate}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  euroRate,
  muted = false,
  separator = false,
}: {
  label: string;
  value: number;
  euroRate: number;
  muted?: boolean;
  separator?: boolean;
}) {
  return (
    <tr
      className={`
        ${separator ? "border-t border-[var(--border-default)]" : ""}
        ${muted ? "opacity-75" : ""}
      `}
    >
      <td className="px-4 py-2.5 text-[var(--text-secondary)] font-medium">{label}</td>
      <td className="px-4 py-2.5 text-right">
        <CurrencyDisplay amountUsd={value} euroRate={euroRate} size="sm" />
      </td>
    </tr>
  );
}
