"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, AlertTriangle, Search, Package } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useIngredients } from "@/hooks/useIngredients";
import { calculateMaterialsCost } from "@/lib/pricing";
import { formatUSD } from "@/lib/currency";

export interface RecipeIngredientEntry {
  ingredient_id: string;
  quantity: number;
  notes?: string;
}

interface RecipeIngredientEditorProps {
  value: RecipeIngredientEntry[];
  onChange: (entries: RecipeIngredientEntry[]) => void;
}

export function RecipeIngredientEditor({
  value,
  onChange,
}: RecipeIngredientEditorProps) {
  const { data: ingredients = [], isLoading } = useIngredients();
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Ingredients not yet added
  const availableIngredients = useMemo(() => {
    const addedIds = new Set(value.map((e) => e.ingredient_id));
    return ingredients.filter(
      (ing) =>
        !addedIds.has(ing.id) &&
        ing.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [ingredients, value, search]);

  function getIngredient(id: string) {
    return ingredients.find((i) => i.id === id);
  }

  function addIngredient(ingredientId: string) {
    onChange([...value, { ingredient_id: ingredientId, quantity: 1 }]);
    setSearch("");
    setShowSearch(false);
  }

  function removeIngredient(ingredientId: string) {
    onChange(value.filter((e) => e.ingredient_id !== ingredientId));
  }

  function updateQuantity(ingredientId: string, quantity: number) {
    onChange(
      value.map((e) =>
        e.ingredient_id === ingredientId ? { ...e, quantity } : e
      )
    );
  }

  function updateNotes(ingredientId: string, notes: string) {
    onChange(
      value.map((e) =>
        e.ingredient_id === ingredientId ? { ...e, notes } : e
      )
    );
  }

  // Calculate cost for a single entry
  function entryCost(entry: RecipeIngredientEntry): number {
    const ing = getIngredient(entry.ingredient_id);
    if (!ing || !ing.package_size) return 0;
    const unitPrice = ing.price_usd / ing.package_size;
    return unitPrice * entry.quantity;
  }

  const totalCost = useMemo(() => {
    return value.reduce((sum, entry) => sum + entryCost(entry), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, ingredients]);

  return (
    <div className="space-y-3">
      {/* Ingredient rows */}
      {value.length === 0 && (
        <div className="text-center py-8 text-[var(--text-muted)] bg-[var(--bg-muted)] rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border-default)]">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No hay ingredientes agregados</p>
          <p className="text-xs mt-1">
            Haz clic en &quot;Agregar ingrediente&quot; para comenzar
          </p>
        </div>
      )}

      {value.length > 0 && (
        <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-muted)]">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold text-[var(--text-secondary)]">
                  Ingrediente
                </th>
                <th className="px-4 py-2.5 text-left font-semibold text-[var(--text-secondary)]">
                  Cantidad
                </th>
                <th className="px-4 py-2.5 text-left font-semibold text-[var(--text-secondary)] hidden md:table-cell">
                  Stock disp.
                </th>
                <th className="px-4 py-2.5 text-right font-semibold text-[var(--text-secondary)]">
                  Costo
                </th>
                <th className="px-4 py-2.5 text-left font-semibold text-[var(--text-secondary)] hidden lg:table-cell">
                  Notas
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {value.map((entry) => {
                const ing = getIngredient(entry.ingredient_id);
                if (!ing) return null;
                const cost = entryCost(entry);
                const stockInsufficient =
                  ing.stock_quantity < entry.quantity;

                return (
                  <tr
                    key={entry.ingredient_id}
                    className="bg-white hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[var(--text-heading)]">
                        {ing.name}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {formatUSD(ing.price_usd / ing.package_size)}/
                        {ing.unit}
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0.001}
                          step="any"
                          value={entry.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              entry.ingredient_id,
                              Number(e.target.value)
                            )
                          }
                          className="w-24 px-2 py-1.5 border border-[var(--border-default)] rounded-[var(--radius-sm)] text-sm text-[var(--text-heading)] focus:outline-none focus:ring-3 focus:ring-[var(--red-100)] focus:border-[var(--red-600)]"
                        />
                        <span className="text-[var(--text-muted)] text-xs font-semibold">
                          {ing.unit}
                        </span>
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        {stockInsufficient && (
                          <AlertTriangle className="w-3.5 h-3.5 text-[var(--warning)] shrink-0" />
                        )}
                        <span
                          className={`text-xs ${
                            stockInsufficient
                              ? "text-[var(--warning)] font-semibold"
                              : "text-[var(--text-muted)]"
                          }`}
                        >
                          {ing.stock_quantity} {ing.unit}
                        </span>
                      </div>
                    </td>

                    {/* Cost */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-[var(--text-heading)]">
                        {formatUSD(cost)}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <input
                        type="text"
                        placeholder="Notas opcionales…"
                        value={entry.notes ?? ""}
                        onChange={(e) =>
                          updateNotes(entry.ingredient_id, e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-[var(--border-default)] rounded-[var(--radius-sm)] text-xs text-[var(--text-heading)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-3 focus:ring-[var(--red-100)] focus:border-[var(--red-600)]"
                      />
                    </td>

                    {/* Remove */}
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        onClick={() => removeIngredient(entry.ingredient_id)}
                        className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--red-600)] hover:bg-[var(--red-50)] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Total row */}
            <tfoot className="bg-[var(--bg-muted)] border-t border-[var(--border-default)]">
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-2.5 font-semibold text-[var(--text-secondary)]"
                >
                  Total materiales ({value.length} ingrediente
                  {value.length !== 1 ? "s" : ""})
                </td>
                <td className="px-4 py-2.5 text-right font-bold text-[var(--red-600)] font-display text-base">
                  {formatUSD(totalCost)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Add ingredient */}
      {showSearch ? (
        <div className="border border-[var(--border-default)] rounded-[var(--radius-md)] p-3 bg-white space-y-2">
          <Input
            placeholder="Buscar ingrediente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto space-y-1">
            {isLoading && (
              <p className="text-sm text-[var(--text-muted)] p-2">Cargando…</p>
            )}
            {!isLoading && availableIngredients.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] p-2">
                {search
                  ? "No se encontraron ingredientes"
                  : "Todos los ingredientes ya fueron agregados"}
              </p>
            )}
            {availableIngredients.map((ing) => (
              <button
                key={ing.id}
                type="button"
                onClick={() => addIngredient(ing.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-[8px] hover:bg-[var(--bg-hover)] transition-colors text-left"
              >
                <div>
                  <span className="text-sm font-semibold text-[var(--text-heading)]">
                    {ing.name}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] ml-2">
                    ({ing.unit})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" size="sm">
                    Stock: {ing.stock_quantity} {ing.unit}
                  </Badge>
                  <span className="text-xs text-[var(--text-secondary)] font-semibold">
                    {formatUSD(ing.price_usd)}/{ing.package_size} {ing.unit}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSearch("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          type="button"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowSearch(true)}
        >
          Agregar ingrediente
        </Button>
      )}

      {/* Insufficient stock warning */}
      {value.some(
        (e) => (getIngredient(e.ingredient_id)?.stock_quantity ?? 0) < e.quantity
      ) && (
        <div className="flex items-start gap-2 bg-[var(--warning-bg)] border border-[var(--warning)]/20 rounded-[var(--radius-md)] p-3">
          <AlertTriangle className="w-4 h-4 text-[var(--warning)] mt-0.5 shrink-0" />
          <p className="text-sm text-[var(--warning)] font-medium font-sans">
            Algunos ingredientes tienen stock insuficiente para producir esta
            receta. Puedes continuar, pero asegúrate de reponer el inventario
            antes de producir.
          </p>
        </div>
      )}
    </div>
  );
}
