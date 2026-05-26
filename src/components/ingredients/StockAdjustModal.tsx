"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Trash2, DollarSign, Package } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAdjustStock } from "@/hooks/useIngredients";
import { formatUSD, formatBs, convertToBs } from "@/lib/currency";

interface StockAdjustModalProps {
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  unit: string;
  priceUsd?: number;
  packageSize?: number;
  euroRate: number;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "IN" | "OUT";

const IN_REASONS = [
  { value: "compra", label: "Compra / Reposición" },
] as const;

const OUT_REASONS = [
  { value: "merma", label: "Merma / Desperdicio" },
  { value: "ajuste", label: "Ajuste de inventario" },
  { value: "produccion", label: "Uso en producción" },
] as const;

export function StockAdjustModal({
  ingredientId,
  ingredientName,
  currentStock,
  unit,
  priceUsd,
  packageSize,
  euroRate,
  isOpen,
  onClose,
}: StockAdjustModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("IN");
  const [quantity, setQuantity] = useState<string>("");
  const [reason, setReason] = useState<string>("compra");
  const [notes, setNotes] = useState<string>("");

  const adjustStock = useAdjustStock();

  // Reset form when modal opens or tab changes
  useEffect(() => {
    if (isOpen) {
      setQuantity("");
      setNotes("");
      setReason(activeTab === "IN" ? "compra" : "merma");
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    setReason(activeTab === "IN" ? "compra" : "merma");
    setQuantity("");
    setNotes("");
  }, [activeTab]);

  const qty = parseFloat(quantity) || 0;

  // Cost calculations for purchase
  const unitPrice = priceUsd && packageSize && packageSize > 0
    ? priceUsd / packageSize
    : null;
  const estimatedCostUsd = unitPrice ? unitPrice * qty : null;
  const estimatedCostBs = estimatedCostUsd
    ? convertToBs(estimatedCostUsd, euroRate)
    : null;

  // Preview of new stock
  const newStock =
    activeTab === "IN"
      ? currentStock + qty
      : Math.max(0, currentStock - qty);

  const handleSubmit = async () => {
    if (!quantity || qty <= 0) return;

    await adjustStock.mutateAsync({
      ingredientId,
      quantity: qty,
      movementType: activeTab,
      reason: reason as "compra" | "produccion" | "merma" | "ajuste",
      euroRate: euroRate > 0 ? euroRate : undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const isIN = activeTab === "IN";
  const reasons = isIN ? IN_REASONS : OUT_REASONS;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajustar Stock"
      size="md"
      footer={
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 w-full">
          <div className="text-sm text-[var(--text-muted)] self-start sm:self-auto">
            <span className="font-semibold text-[var(--text-secondary)]">Stock actual:</span>{" "}
            {currentStock.toLocaleString("es-VE")} {unit}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              className="flex-1 sm:flex-initial"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              variant={isIN ? "primary" : "danger"}
              className="flex-1 sm:flex-initial"
              isLoading={adjustStock.isPending}
              onClick={handleSubmit}
              disabled={!quantity || qty <= 0}
            >
              {isIN ? "Registrar Compra" : "Registrar Salida"}
            </Button>
          </div>
        </div>
      }
    >
      {/* Ingredient Name */}
      <div className="flex items-center gap-3 mb-5 p-3 bg-[var(--bg-muted)] border border-[var(--border-default)] rounded-[var(--radius-md)]">
        <div className="w-9 h-9 bg-[var(--red-100)] rounded-[8px] flex items-center justify-center">
          <Package className="w-5 h-5 text-[var(--red-600)]" />
        </div>
        <div>
          <p className="font-semibold text-[var(--text-heading)]">{ingredientName}</p>
          <p className="text-xs text-[var(--text-muted)]">
            Stock actual: {currentStock.toLocaleString("es-VE")} {unit}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-[var(--radius-md)] p-1 bg-[var(--bg-muted)] mb-5">
        <button
          onClick={() => setActiveTab("IN")}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-sm font-semibold
            transition-all duration-200
            ${
              activeTab === "IN"
                ? "bg-white text-[var(--red-600)] shadow-sm border border-[var(--border-default)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }
          `}
        >
          <ShoppingCart className="w-4 h-4" />
          Compra (Entrada)
        </button>
        <button
          onClick={() => setActiveTab("OUT")}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-sm font-semibold
            transition-all duration-200
            ${
              activeTab === "OUT"
                ? "bg-white text-[var(--red-600)] shadow-sm border border-[var(--red-100)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }
          `}
        >
          <Trash2 className="w-4 h-4" />
          Merma / Ajuste
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Quantity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--text-secondary)]">
            Cantidad <span className="text-[var(--text-muted)] font-normal">({unit})</span>
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={`Ej: 500`}
            className="w-full py-2.5 px-3 border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-heading)] bg-white
              placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:ring-3 focus:ring-[var(--red-100)]
              focus:border-[var(--red-600)] transition-all duration-200 text-lg font-bold"
          />
        </div>

        {/* Reason */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--text-secondary)]">Motivo</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full py-2.5 px-3 border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-heading)] bg-white
              focus:outline-none focus:ring-3 focus:ring-[var(--red-100)] focus:border-[var(--red-600)]
              transition-all duration-200 text-sm"
          >
            {reasons.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--text-secondary)]">
            Notas <span className="text-[var(--text-muted)] font-normal">(opcional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Compra en el mercado principal..."
            rows={2}
            className="w-full py-2.5 px-3 border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-heading)] bg-white
              placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:ring-3 focus:ring-[var(--red-100)]
              focus:border-[var(--red-600)] transition-all duration-200 resize-none text-sm"
          />
        </div>

        {/* Purchase Cost Estimate (only for IN) */}
        {isIN && qty > 0 && estimatedCostUsd !== null && (
          <div className="p-4 bg-[var(--red-50)] border border-[var(--red-100)] rounded-[var(--radius-md)]">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[var(--red-600)]" />
              <span className="text-sm font-bold text-[var(--red-600)]">
                Costo estimado de compra
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-[var(--radius-md)] p-3 border border-[var(--border-default)]">
                <p className="text-xs text-[var(--text-muted)] mb-1">En USD</p>
                <p className="text-lg font-bold text-[var(--text-heading)] font-display">
                  {formatUSD(estimatedCostUsd)}
                </p>
              </div>
              <div className="bg-white rounded-[var(--radius-md)] p-3 border border-[var(--border-default)]">
                <p className="text-xs text-[var(--text-muted)] mb-1">En Bolívares</p>
                <p className="text-lg font-bold text-[var(--text-heading)] font-display">
                  {formatBs(estimatedCostBs!)}
                </p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
              Basado en precio unitario de{" "}
              <span className="font-semibold text-[var(--text-secondary)]">
                {formatUSD(unitPrice!)}
              </span>
              /{unit}
            </p>
          </div>
        )}

        {/* Stock Preview */}
        {qty > 0 && (
          <div
            className={`p-4 rounded-[var(--radius-md)] border ${
              isIN
                ? "bg-green-50 border-green-200"
                : newStock === 0
                ? "bg-red-50 border-red-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--text-secondary)]">
                Nuevo stock después del ajuste:
              </span>
              <span
                className={`text-lg font-bold ${
                  isIN
                    ? "text-green-700"
                    : newStock === 0
                    ? "text-red-700"
                    : "text-amber-700"
                }`}
              >
                {newStock.toLocaleString("es-VE")} {unit}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>{currentStock.toLocaleString("es-VE")} {unit}</span>
              <span>{isIN ? "+" : "−"}</span>
              <span className={`font-semibold ${isIN ? "text-green-600" : "text-red-600"}`}>
                {qty.toLocaleString("es-VE")} {unit}
              </span>
              <span>=</span>
              <span className="font-bold text-[var(--text-heading)]">
                {newStock.toLocaleString("es-VE")} {unit}
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
