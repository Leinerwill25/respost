"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { calculatePriceByMultiplication } from "@/lib/pricing";
import type { PriceBreakdown } from "@/types";
import { formatUSD } from "@/lib/currency";

interface MethodMultiplicationProps {
  materialsCostUsd: number;
  portions: number;
  euroRate: number;
  onChange: (breakdown: PriceBreakdown) => void;
  initialValues?: {
    costMultiplier?: number;
    taxPct?: number;
  };
  layout?: "sidebar" | "full";
}

export function MethodMultiplication({
  materialsCostUsd,
  portions,
  euroRate,
  onChange,
  initialValues,
  layout = "full",
}: MethodMultiplicationProps) {
  const [costMultiplier, setCostMultiplier] = useState(
    initialValues?.costMultiplier ?? 2
  );
  const [taxPct, setTaxPct] = useState(initialValues?.taxPct ?? 0);

  const calculated = calculatePriceByMultiplication({
    materialsCostUsd,
    costMultiplier,
    taxPct,
    portions,
  });

  const breakdown = {
    ...calculated,
    costMultiplier,
    taxPct,
  } as any;

  useEffect(() => {
    onChange(breakdown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialsCostUsd, costMultiplier, taxPct, portions]);

  const isSidebar = layout === "sidebar";

  return (
    <div className="space-y-5">
      {/* Tutorial */}
      <div className="flex gap-3 items-start bg-[var(--info-bg)] border border-[var(--info)]/20 rounded-[var(--radius-md)] p-3">
        <Info className="w-4 h-4 text-[var(--info)] mt-0.5 shrink-0" />
        <p className="text-sm text-[var(--info)] font-medium font-sans">
          El multiplicador indica cuántas veces el costo de tus materiales será
          tu precio de venta. Por ejemplo, un multiplicador de 3× significa que
          si tus materiales cuestan $10, venderás a $30.
        </p>
      </div>

      {/* Fields */}
      <div className={isSidebar ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
        <Input
          label="Multiplicador"
          type="number"
          min={1}
          max={20}
          step={0.1}
          value={costMultiplier}
          onChange={(e) => setCostMultiplier(Number(e.target.value))}
          helperText={`Precio = ${costMultiplier}× el costo de materiales`}
          rightIcon={<span className="text-xs font-bold text-[var(--red-600)]">×</span>}
        />
        <Input
          label="Impuesto (%)"
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={taxPct}
          onChange={(e) => setTaxPct(Number(e.target.value))}
          helperText="Impuesto o IVA"
        />
      </div>

      {/* Visual multiplier indicator - Grid system for narrow responsiveness */}
      <div className="grid grid-cols-5 gap-1.5 items-center bg-[var(--red-50)] border border-[var(--red-100)] rounded-[var(--radius-md)] p-3 text-center">
        <div className="min-w-0">
          <div className="text-[10px] text-[var(--text-muted)] truncate mb-0.5">Materiales</div>
          <div className="font-bold text-xs text-[var(--text-heading)] truncate">
            {formatUSD(materialsCostUsd)}
          </div>
        </div>
        <div className="text-xs sm:text-sm font-bold text-[var(--red-600)] shrink-0">×{costMultiplier}</div>
        <div className="text-xs sm:text-sm text-[var(--text-muted)] shrink-0">=</div>
        <div className="col-span-2 min-w-0 bg-white border border-[var(--border-default)] rounded-[8px] py-1 px-2 shadow-sm">
          <div className="text-[10px] text-[var(--text-muted)] truncate mb-0.5">Precio base</div>
          <div className="font-bold text-xs text-[var(--red-600)] truncate">
            {formatUSD(breakdown.subtotalUsd)}
          </div>
        </div>
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
              label={`Margen incluido (×${costMultiplier})`}
              value={breakdown.productionCostUsd}
              euroRate={euroRate}
              muted
            />
            <BreakdownRow
              label="Precio base"
              value={breakdown.subtotalUsd}
              euroRate={euroRate}
              separator
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
