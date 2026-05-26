"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChefHat,
  Edit,
  Trash2,
  Factory,
  AlertTriangle,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { Modal } from "@/components/ui/Modal";
import { useRecipe, useDeleteRecipe } from "@/hooks/useRecipes";
import { useEuroRate } from "@/hooks/useRates";
import { calculatePrice, calculateMaterialsCost } from "@/lib/pricing";
import { formatUSD } from "@/lib/currency";
import type { PricingMethod } from "@/types";

const METHOD_LABELS: Record<PricingMethod, string> = {
  percentage: "Porcentaje",
  fixed: "Precio Fijo",
  multiplication: "Multiplicación",
};

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: recipe, isLoading } = useRecipe(id);
  const { data: rateData } = useEuroRate();
  const deleteRecipe = useDeleteRecipe();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const euroRate = rateData?.rate ?? 0;

  const materialsCostUsd = useMemo(() => {
    if (!recipe?.recipe_ingredients) return 0;
    return calculateMaterialsCost(
      recipe.recipe_ingredients.map((ri) => ({
        quantity: ri.quantity,
        price_usd: ri.ingredients.price_usd,
        package_size: ri.ingredients.package_size,
      }))
    );
  }, [recipe]);

  const priceBreakdown = useMemo(() => {
    if (!recipe) return null;
    return calculatePrice(recipe.pricing_method as PricingMethod, {
      materialsCostUsd,
      portions: recipe.portions,
      taxPct: recipe.tax_pct ?? 0,
      costProductionPct: recipe.cost_production_pct ?? 50,
      profitPct: recipe.profit_pct ?? 50,
      fixedCostUsd: recipe.fixed_cost_usd ?? 0,
      fixedProfitUsd: recipe.fixed_profit_usd ?? 0,
      costMultiplier: recipe.cost_multiplier ?? 2,
    });
  }, [recipe, materialsCostUsd]);

  const handleDelete = async () => {
    await deleteRecipe.mutateAsync(id);
    router.push("/recetas");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <div className="h-12 bg-[#FAE8E5] rounded-[12px] animate-pulse" />
        <div className="h-48 bg-[#FAE8E5] rounded-[12px] animate-pulse" />
        <div className="h-64 bg-[#FAE8E5] rounded-[12px] animate-pulse" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-20">
        <ChefHat className="w-12 h-12 text-[#A07050] mx-auto mb-3" />
        <h3 className="font-display text-xl text-[#2C1208]">
          Receta no encontrada
        </h3>
        <Link href="/recetas">
          <Button variant="ghost" className="mt-4" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Volver a Recetas
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title={recipe.name}
        subtitle={recipe.description ?? undefined}
        breadcrumb={[
          { label: "Recetas", href: "/recetas" },
          { label: recipe.name },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Link href={`/produccion?recipe=${recipe.id}`} className="flex-1 sm:flex-initial">
              <Button
                variant="secondary"
                className="w-full"
                leftIcon={<Factory className="w-4 h-4" />}
              >
                Producir
              </Button>
            </Link>
            <Link href={`/recetas/${recipe.id}/editar`} className="flex-1 sm:flex-initial">
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Edit className="w-4 h-4" />}
              >
                Editar
              </Button>
            </Link>
            <Button
              variant="danger"
              className="flex-1 sm:flex-initial"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setConfirmDelete(true)}
            >
              Eliminar
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recipe info */}
          <Card>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {recipe.category && (
                <Badge variant="default">{recipe.category}</Badge>
              )}
              <Badge variant={
                recipe.pricing_method === "percentage" ? "primary" :
                recipe.pricing_method === "fixed" ? "success" : "info"
              }>
                {METHOD_LABELS[recipe.pricing_method as PricingMethod]}
              </Badge>
              <div className="flex items-center gap-1.5 text-sm text-[#6B3A1F]">
                <Layers className="w-4 h-4" />
                <span>
                  {recipe.portions} {recipe.portion_label ?? "porciones"}
                </span>
              </div>
            </div>
          </Card>

          {/* Ingredients table */}
          <Card padding="none">
            <div className="p-5 pb-3">
              <CardHeader
                title="Ingredientes"
                subtitle={`${recipe.recipe_ingredients?.length ?? 0} ingrediente(s)`}
              />
            </div>

            {(!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) ? (
              <div className="text-center py-8 text-[#A07050]">
                <p className="text-sm">No hay ingredientes registrados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F5EDE0]">
                    <tr>
                      <th className="px-5 py-2.5 text-left font-medium text-[#6B3A1F]">
                        Ingrediente
                      </th>
                      <th className="px-5 py-2.5 text-left font-medium text-[#6B3A1F]">
                        Cantidad
                      </th>
                      <th className="px-5 py-2.5 text-left font-medium text-[#6B3A1F] hidden sm:table-cell">
                        Stock
                      </th>
                      <th className="px-5 py-2.5 text-right font-medium text-[#6B3A1F]">
                        Costo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8D5BE]">
                    {recipe.recipe_ingredients.map((ri) => {
                      const unitPrice =
                        ri.ingredients.price_usd / ri.ingredients.package_size;
                      const cost = unitPrice * ri.quantity;
                      const stockSufficient =
                        ri.ingredients.stock_quantity >= ri.quantity;

                      return (
                        <tr
                          key={ri.id}
                          className="hover:bg-[#FDF3F1] transition-colors"
                        >
                          <td className="px-5 py-3">
                            <div className="font-medium text-[#2C1208]">
                              {ri.ingredients.name}
                            </div>
                            {ri.notes && (
                              <div className="text-xs text-[#A07050] mt-0.5">
                                {ri.notes}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 text-[#6B3A1F]">
                            {ri.quantity} {ri.ingredients.unit}
                          </td>
                          <td className="px-5 py-3 hidden sm:table-cell">
                            <div className="flex items-center gap-1.5">
                              {!stockSufficient && (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              )}
                              <span
                                className={`text-xs ${
                                  stockSufficient
                                    ? "text-[#A07050]"
                                    : "text-amber-600 font-medium"
                                }`}
                              >
                                {ri.ingredients.stock_quantity}{" "}
                                {ri.ingredients.unit}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-[#2C1208]">
                            {formatUSD(cost)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-[#F5EDE0]">
                    <tr>
                      <td
                        colSpan={2}
                        className="px-5 py-2.5 font-medium text-[#6B3A1F] sm:hidden"
                      >
                        Total materiales
                      </td>
                      <td
                        colSpan={3}
                        className="px-5 py-2.5 font-medium text-[#6B3A1F] hidden sm:table-cell"
                      >
                        Total materiales
                      </td>
                      <td className="px-5 py-2.5 text-right font-bold text-[#C43B2A]">
                        {formatUSD(materialsCostUsd)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right column: Price breakdown */}
        <div className="space-y-4">
          {priceBreakdown && (
            <Card>
              <CardHeader
                title="Precio de Venta"
                subtitle={METHOD_LABELS[recipe.pricing_method as PricingMethod]}
              />

              <div className="space-y-2.5">
                <BreakdownLine
                  label="Materiales"
                  value={priceBreakdown.materialsCostUsd}
                  euroRate={euroRate}
                />
                <BreakdownLine
                  label="Costo producción"
                  value={priceBreakdown.productionCostUsd}
                  euroRate={euroRate}
                  muted
                />
                <BreakdownLine
                  label="Subtotal"
                  value={priceBreakdown.subtotalUsd}
                  euroRate={euroRate}
                  separator
                />
                {priceBreakdown.profitUsd > 0 && (
                  <BreakdownLine
                    label="Utilidad"
                    value={priceBreakdown.profitUsd}
                    euroRate={euroRate}
                    muted
                  />
                )}
                {priceBreakdown.taxUsd > 0 && (
                  <BreakdownLine
                    label="Impuesto"
                    value={priceBreakdown.taxUsd}
                    euroRate={euroRate}
                    muted
                  />
                )}

                <div className="bg-[#C43B2A] rounded-[10px] p-3 mt-3">
                  <div className="text-white/80 text-xs mb-1">PRECIO VENTA</div>
                  <CurrencyDisplay
                    amountUsd={priceBreakdown.salePriceUsd}
                    euroRate={euroRate}
                    size="lg"
                    className="text-white [&>span]:text-white [&>span:last-child]:text-white/80"
                  />
                </div>

                <div className="border-t border-[#E8D5BE] pt-2.5">
                  <div className="text-xs text-[#A07050] mb-1">
                    Por porción
                  </div>
                  <CurrencyDisplay
                    amountUsd={priceBreakdown.pricePerPortionUsd}
                    euroRate={euroRate}
                    size="md"
                  />
                </div>

                {euroRate > 0 && (
                  <p className="text-xs text-[#A07050] border-t border-[#E8D5BE] pt-2">
                    Tasa EUR: {euroRate.toFixed(2)} Bs.
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Eliminar receta"
      >
        <div className="space-y-4">
          <p className="text-[#6B3A1F]">
            ¿Estás seguro de que deseas eliminar{" "}
            <strong>{recipe.name}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => setConfirmDelete(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="w-full sm:w-auto"
              isLoading={deleteRecipe.isPending}
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function BreakdownLine({
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
    <div
      className={`flex items-center justify-between ${
        separator ? "border-t border-[#E8D5BE] pt-2.5" : ""
      } ${muted ? "opacity-70" : ""}`}
    >
      <span className="text-sm text-[#6B3A1F]">{label}</span>
      <CurrencyDisplay amountUsd={value} euroRate={euroRate} size="sm" />
    </div>
  );
}
