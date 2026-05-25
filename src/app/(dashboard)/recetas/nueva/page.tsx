"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChefHat } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  RecipeIngredientEditor,
  type RecipeIngredientEntry,
} from "@/components/recipes/RecipeIngredientEditor";
import { PriceCalculator } from "@/components/recipes/PriceCalculator";
import { useCreateRecipe } from "@/hooks/useRecipes";
import { useEuroRate } from "@/hooks/useRates";
import { useIngredients } from "@/hooks/useIngredients";
import { calculateMaterialsCost } from "@/lib/pricing";
import type { PriceBreakdown, PricingMethod } from "@/types";

const CATEGORIES = [
  "Tortas",
  "Cupcakes",
  "Galletas",
  "Brownies",
  "Tartas",
  "Postres",
  "Panadería",
  "Otro",
];

const schema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  description: z.string().optional(),
  category: z.string().optional(),
  portions: z.number().min(1, "Mínimo 1 porción"),
  portion_label: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NuevaRecetaPage() {
  const router = useRouter();
  const createRecipe = useCreateRecipe();
  const { data: rateData } = useEuroRate();
  const { data: ingredients = [] } = useIngredients();

  const euroRate = rateData?.rate ?? 0;

  const [recipeIngredients, setRecipeIngredients] = useState<
    RecipeIngredientEntry[]
  >([]);
  const [pricingMethod, setPricingMethod] = useState<PricingMethod>("percentage");
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(
    null
  );
  const [pricingValues, setPricingValues] = useState({
    costProductionPct: 50,
    profitPct: 50,
    taxPct: 0,
    fixedCostUsd: 0,
    fixedProfitUsd: 0,
    costMultiplier: 2,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      portions: 12,
      portion_label: "porciones",
    },
  });

  const portions = watch("portions") ?? 12;

  const ingredientMap = useMemo(() => {
    return new Map(ingredients.map((i) => [i.id, i]));
  }, [ingredients]);

  const materialsCostUsd = useMemo(() => {
    return calculateMaterialsCost(
      recipeIngredients
        .map((e) => {
          const ing = ingredientMap.get(e.ingredient_id);
          if (!ing) return null;
          return {
            quantity: e.quantity,
            price_usd: ing.price_usd,
            package_size: ing.package_size,
          };
        })
        .filter(Boolean) as { quantity: number; price_usd: number; package_size: number }[]
    );
  }, [recipeIngredients, ingredientMap]);

  const handleBreakdownChange = useCallback((breakdown: PriceBreakdown) => {
    setPriceBreakdown(breakdown);
    const b = breakdown as any;
    setPricingValues((prev) => ({
      ...prev,
      costProductionPct: b.costProductionPct ?? prev.costProductionPct,
      profitPct: b.profitPct ?? prev.profitPct,
      taxPct: b.taxPct ?? prev.taxPct,
      fixedCostUsd: b.fixedCostUsd ?? prev.fixedCostUsd,
      fixedProfitUsd: b.fixedProfitUsd ?? prev.fixedProfitUsd,
      costMultiplier: b.costMultiplier ?? prev.costMultiplier,
    }));
  }, []);

  const onSubmit = async (data: FormValues) => {
    const recipePayload = {
      name: data.name,
      description: data.description ?? null,
      category: data.category ?? null,
      portions: data.portions,
      portion_label: data.portion_label ?? null,
      pricing_method: pricingMethod,
      cost_production_pct:
        pricingMethod === "percentage" ? pricingValues.costProductionPct : null,
      profit_pct:
        pricingMethod === "percentage" ? pricingValues.profitPct : null,
      tax_pct: pricingValues.taxPct,
      fixed_cost_usd:
        pricingMethod === "fixed" ? pricingValues.fixedCostUsd : null,
      fixed_profit_usd:
        pricingMethod === "fixed" ? pricingValues.fixedProfitUsd : null,
      cost_multiplier:
        pricingMethod === "multiplication" ? pricingValues.costMultiplier : null,
      image_url: null,
      is_active: true,
    };

    const ingredientPayload = recipeIngredients.map((e) => ({
      ingredient_id: e.ingredient_id,
      quantity: e.quantity,
      notes: e.notes ?? null,
    }));

    const result = await createRecipe.mutateAsync({
      recipe: recipePayload,
      ingredients: ingredientPayload,
    });

    router.push(`/recetas/${result.id}`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Nueva Receta"
        subtitle="Define los ingredientes y calcula el precio de venta"
        breadcrumb={[
          { label: "Recetas", href: "/recetas" },
          { label: "Nueva Receta" },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Basic Info */}
        <Card>
          <CardHeader
            title="Información básica"
            subtitle="Datos generales de la receta"
            icon={<ChefHat className="w-5 h-5" />}
          />

          <div className="space-y-4">
            <Input
              label="Nombre de la receta *"
              placeholder="Ej: Torta de chocolate tres leches"
              error={errors.name?.message}
              {...register("name")}
            />

            <div>
              <label className="text-sm font-medium text-[#6B3A1F] mb-1.5 block">
                Descripción
              </label>
              <textarea
                placeholder="Descripción breve de la receta (opcional)"
                rows={3}
                className="w-full px-3 py-2.5 border border-[#E8D5BE] rounded-[8px] text-[#2C1208] bg-white placeholder:text-[#A07050]/60 focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] resize-none text-sm"
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-[#6B3A1F] mb-1.5 block">
                  Categoría
                </label>
                <select
                  className="w-full px-3 py-2.5 border border-[#E8D5BE] rounded-[8px] text-[#2C1208] bg-white focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] text-sm"
                  {...register("category")}
                >
                  <option value="">Sin categoría</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Número de porciones *"
                type="number"
                min={1}
                error={errors.portions?.message}
                {...register("portions", { valueAsNumber: true })}
              />

              <Input
                label="Etiqueta de porción"
                placeholder="porciones, rebanadas…"
                {...register("portion_label")}
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Ingredients */}
        <Card>
          <CardHeader
            title="Ingredientes"
            subtitle="Agrega los insumos y sus cantidades"
          />
          <RecipeIngredientEditor
            value={recipeIngredients}
            onChange={setRecipeIngredients}
          />
        </Card>

        {/* Section 3: Pricing */}
        <Card>
          <CardHeader
            title="Calculadora de Precio"
            subtitle="Elige el método de fijación de precio"
          />
          <PriceCalculator
            materialsCostUsd={materialsCostUsd}
            portions={Number(portions) || 1}
            euroRate={euroRate}
            pricingMethod={pricingMethod}
            onMethodChange={setPricingMethod}
            onChange={handleBreakdownChange}
            initialValues={pricingValues}
          />
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/recetas")}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={createRecipe.isPending}
            leftIcon={<ChefHat className="w-4 h-4" />}
          >
            Crear Receta
          </Button>
        </div>
      </form>
    </div>
  );
}
