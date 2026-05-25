"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  ChefHat,
  CheckCircle2,
  AlertTriangle,
  Package,
  DollarSign,
  Hash,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { Badge } from "@/components/ui/Badge";

import { useRecipes, useRecipe } from "@/hooks/useRecipes";
import { useProduction } from "@/hooks/useProduction";
import { useEuroRate } from "@/hooks/useRates";
import { calculateMaterialsCost, calculatePrice } from "@/lib/pricing";
import { formatUSD, formatBs, convertToBs } from "@/lib/currency";
import type { PricingMethod } from "@/types";

const schema = z.object({
  quantity: z.number().min(1, "Mínimo 1 producción"),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ProduccionPage() {
  const [search, setSearch] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: recipes = [], isLoading: loadingRecipes } = useRecipes();
  const { data: recipe, isLoading: loadingRecipe } = useRecipe(selectedRecipeId ?? "");
  const { data: rateData, isLoading: loadingRate } = useEuroRate();
  const production = useProduction();

  const euroRate = rateData?.rate ?? 1;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1 },
  });

  const quantity = watch("quantity") || 1;

  const filteredRecipes = useMemo(() => {
    if (!search) return recipes;
    const q = search.toLowerCase();
    return recipes.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.category ?? "").toLowerCase().includes(q)
    );
  }, [recipes, search]);

  const ingredientAnalysis = useMemo(() => {
    if (!recipe || !recipe.recipe_ingredients) return null;

    const ingredients = recipe.recipe_ingredients.map((ri) => {
      const ing = ri.ingredients;
      const neededQty = ri.quantity * quantity;
      const unitCost = ing.price_usd / ing.package_size;
      const costUsd = unitCost * ri.quantity;
      const available = ing.stock_quantity;
      const sufficient = available >= neededQty;

      return {
        id: ri.id,
        ingredient_id: ri.ingredient_id,
        name: ing.name,
        unit: ing.unit,
        neededPerBatch: ri.quantity,
        neededTotal: neededQty,
        available,
        costPerBatch: costUsd,
        unitCost,
        sufficient,
      };
    });

    const materialsCostPerBatch = calculateMaterialsCost(
      recipe.recipe_ingredients.map((ri) => ({
        quantity: ri.quantity,
        price_usd: ri.ingredients.price_usd,
        package_size: ri.ingredients.package_size,
      }))
    );
    const totalMaterialsCost = materialsCostPerBatch * quantity;

    const pricing = calculatePrice(
      recipe.pricing_method as PricingMethod,
      {
        materialsCostUsd: totalMaterialsCost,
        portions: (recipe.portions || 1) * quantity,
        taxPct: recipe.tax_pct ?? 0,
        costProductionPct: recipe.cost_production_pct ?? 50,
        profitPct: recipe.profit_pct ?? 50,
        fixedCostUsd: (recipe.fixed_cost_usd ?? 0) * quantity,
        fixedProfitUsd: (recipe.fixed_profit_usd ?? 0) * quantity,
        costMultiplier: recipe.cost_multiplier ?? 2,
      }
    );

    const hasInsufficientStock = ingredients.some((i) => !i.sufficient);

    return {
      ingredients,
      materialsCostPerBatch,
      totalMaterialsCost,
      pricing,
      hasInsufficientStock,
      totalUnits: (recipe.portions || 1) * quantity,
    };
  }, [recipe, quantity]);

  const onSubmit = handleSubmit(async (data) => {
    if (!recipe || !ingredientAnalysis) return;

    const totalCostUsd = ingredientAnalysis.totalMaterialsCost;
    const salePriceUsd = ingredientAnalysis.pricing.salePriceUsd;
    const costPerUnit = totalCostUsd / ingredientAnalysis.totalUnits;

    await production.mutateAsync({
      recipe_id: recipe.id,
      quantity_produced: ingredientAnalysis.totalUnits,
      euro_rate: euroRate,
      total_cost_usd: totalCostUsd,
      total_cost_bs: convertToBs(totalCostUsd, euroRate),
      sale_price_usd: ingredientAnalysis.pricing.pricePerPortionUsd,
      cost_price_usd: costPerUnit,
      notes: data.notes,
    });

    toast.success(
      `✓ ${ingredientAnalysis.totalUnits} unidades de "${recipe.name}" agregadas al inventario`
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar Producción"
        subtitle="Selecciona una receta y registra tu lote de producción"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Producción" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recipe Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader
              title="Paso 1: Seleccionar Receta"
              icon={<ChefHat className="w-5 h-5" />}
            />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07050]" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Buscar receta..."
                className="w-full pl-9 pr-4 py-2.5 rounded-[12px] border border-[#E8D5BE] bg-white text-[#2C1208] placeholder-[#A07050] focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] text-sm"
              />
            </div>

            {showDropdown && (
              <div className="mt-2 max-h-64 overflow-y-auto border border-[#E8D5BE] rounded-[12px] bg-white shadow-lg z-10">
                {loadingRecipes ? (
                  <div className="p-4 text-center text-[#A07050] text-sm">Cargando recetas...</div>
                ) : filteredRecipes.length === 0 ? (
                  <div className="p-4 text-center text-[#A07050] text-sm">Sin resultados</div>
                ) : (
                  filteredRecipes.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedRecipeId(r.id);
                        setSearch(r.name);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-[#FFF8F3] transition-colors border-b border-[#E8D5BE] last:border-0 ${
                        selectedRecipeId === r.id ? "bg-[#FAE8E5]" : ""
                      }`}
                    >
                      <div className="font-medium text-[#2C1208] text-sm">{r.name}</div>
                      {r.category && (
                        <div className="text-xs text-[#A07050] mt-0.5">{r.category}</div>
                      )}
                      <div className="text-xs text-[#6B3A1F] mt-0.5">
                        {r.portions} {r.portion_label || "porciones"}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {selectedRecipeId && recipe && (
              <div className="mt-4 p-3 bg-[#FAE8E5] rounded-[12px]">
                <div className="text-sm font-semibold text-[#2C1208]">{recipe.name}</div>
                <div className="text-xs text-[#6B3A1F] mt-1">
                  {recipe.portions} {recipe.portion_label || "porciones"} por lote
                </div>
                <div className="text-xs text-[#A07050] mt-0.5">
                  Método: {recipe.pricing_method === "percentage"
                    ? "Porcentaje"
                    : recipe.pricing_method === "fixed"
                    ? "Precio Fijo"
                    : "Multiplicación"}
                </div>
              </div>
            )}
          </Card>

          {selectedRecipeId && (
            <Card>
              <CardHeader
                title="Paso 2: Cantidad"
                icon={<Hash className="w-5 h-5" />}
              />
              <label className="block text-sm font-medium text-[#6B3A1F] mb-1">
                ¿Cuántas veces haces esta receta?
              </label>
              <input
                type="number"
                min={1}
                {...register("quantity", { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-[12px] border border-[#E8D5BE] bg-white text-[#2C1208] focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] text-sm"
              />
              {errors.quantity && (
                <p className="text-[#C43B2A] text-xs mt-1">{errors.quantity.message}</p>
              )}
              <p className="text-xs text-[#A07050] mt-2">
                Total a producir: <strong>{(recipe?.portions || 1) * (quantity || 1)}</strong>{" "}
                {recipe?.portion_label || "unidades"}
              </p>

              <div className="mt-4">
                <label className="block text-sm font-medium text-[#6B3A1F] mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  {...register("notes")}
                  rows={2}
                  placeholder="Observaciones del lote..."
                  className="w-full px-4 py-2.5 rounded-[12px] border border-[#E8D5BE] bg-white text-[#2C1208] placeholder-[#A07050] focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] text-sm resize-none"
                />
              </div>
            </Card>
          )}
        </div>

        {/* Right: Ingredient Analysis + Totals */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedRecipeId ? (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center text-[#A07050]">
                <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Selecciona una receta para comenzar</p>
              </div>
            </Card>
          ) : loadingRecipe ? (
            <Card className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#C43B2A]" />
            </Card>
          ) : ingredientAnalysis ? (
            <>
              {ingredientAnalysis.hasInsufficientStock && (
                <div className="flex items-start gap-3 p-4 bg-[#FFF3E0] border border-[#FFCC80] border-l-4 border-l-[#E65100] rounded-[12px]">
                  <AlertTriangle className="w-5 h-5 text-[#E65100] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#E65100]">
                      Stock insuficiente para algunos ingredientes
                    </p>
                    <p className="text-xs text-[#E65100]/80 mt-0.5">
                      Puedes continuar pero el stock se ajustará a 0 para los ingredientes
                      insuficientes. Considera reponer el inventario primero.
                    </p>
                  </div>
                </div>
              )}

              <Card padding="none">
                <div className="p-6 pb-0">
                  <CardHeader
                    title="Ingredientes Necesarios"
                    icon={<Package className="w-5 h-5" />}
                    subtitle={`${ingredientAnalysis.ingredients.length} ingredientes · ${ingredientAnalysis.totalUnits} unidades a producir`}
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E8D5BE] bg-[#F5EDE0]">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Ingrediente</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Necesario</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Disponible</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Costo</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredientAnalysis.ingredients.map((ing) => (
                        <tr
                          key={ing.id}
                          className={`border-b border-[#E8D5BE] last:border-0 transition-colors ${
                            !ing.sufficient ? "bg-[#FFF3E0]/50" : "hover:bg-[#FDF3F1]"
                          }`}
                        >
                          <td className="px-6 py-3">
                            <div className="font-medium text-[#2C1208]">{ing.name}</div>
                            <div className="text-xs text-[#A07050]">
                              {ing.neededPerBatch} {ing.unit} × {quantity} lote(s)
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-medium text-[#2C1208]">
                              {ing.neededTotal.toLocaleString("es-VE")} {ing.unit}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={
                                ing.sufficient
                                  ? "text-[#2E7D32] font-medium"
                                  : "text-[#E65100] font-medium"
                              }
                            >
                              {ing.available.toLocaleString("es-VE")} {ing.unit}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-[#2C1208] font-medium">
                              {formatUSD(ing.costPerBatch * quantity)}
                            </div>
                            <div className="text-xs text-[#A07050]">
                              {formatBs(convertToBs(ing.costPerBatch * quantity, euroRate))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {ing.sufficient ? (
                              <CheckCircle2 className="w-5 h-5 text-[#2E7D32] mx-auto" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-[#E65100] mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <CardHeader
                  title="Resumen de Costos y Precios"
                  icon={<DollarSign className="w-5 h-5" />}
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#FAE8E5] rounded-[10px]">
                    <p className="text-xs text-[#A07050] mb-1">Costo Total Materiales</p>
                    <CurrencyDisplay
                      amountUsd={ingredientAnalysis.totalMaterialsCost}
                      euroRate={euroRate}
                      size="sm"
                    />
                  </div>
                  <div className="p-4 bg-[#FAE8E5] rounded-[10px]">
                    <p className="text-xs text-[#A07050] mb-1">Precio Venta Total</p>
                    <CurrencyDisplay
                      amountUsd={ingredientAnalysis.pricing.salePriceUsd}
                      euroRate={euroRate}
                      size="sm"
                    />
                  </div>
                  <div className="p-4 bg-[#EDF7EE] rounded-[10px]">
                    <p className="text-xs text-[#2E7D32] mb-1">Precio por Unidad</p>
                    <CurrencyDisplay
                      amountUsd={ingredientAnalysis.pricing.pricePerPortionUsd}
                      euroRate={euroRate}
                      size="sm"
                    />
                  </div>
                  <div className="p-4 bg-[#E3F0FF] rounded-[10px]">
                    <p className="text-xs text-[#1565C0] mb-1">Unidades a Producir</p>
                    <p className="text-xl font-bold text-[#1565C0]">
                      {ingredientAnalysis.totalUnits}
                    </p>
                    <p className="text-xs text-[#1565C0]">{recipe?.portion_label || "unidades"}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-4 border-t border-[#E8D5BE]">
                  <div className="text-sm text-[#A07050]">
                    Tasa EUR: <span className="font-semibold text-[#2C1208]">{euroRate.toFixed(2)} Bs</span>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    isLoading={production.isPending}
                    onClick={onSubmit}
                    leftIcon={<ChefHat className="w-5 h-5" />}
                  >
                    Registrar Producción
                  </Button>
                </div>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
