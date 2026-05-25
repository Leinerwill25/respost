"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChefHat, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  RecipeIngredientEditor,
  type RecipeIngredientEntry,
} from "@/components/recipes/RecipeIngredientEditor";
import { PriceCalculator } from "@/components/recipes/PriceCalculator";
import { useRecipe, useUpdateRecipe } from "@/hooks/useRecipes";
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
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  portions: z.number().min(1, "Mínimo 1 porción"),
  portion_label: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export default function EditarRecetaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: recipe, isLoading: loadingRecipe } = useRecipe(id);
  const updateRecipe = useUpdateRecipe();
  const { data: rateData } = useEuroRate();
  const { data: ingredients = [], isLoading: loadingIngs } = useIngredients();

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
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const portions = watch("portions") ?? 12;

  useEffect(() => {
    if (recipe) {
      reset({
        name: recipe.name,
        description: recipe.description,
        category: recipe.category,
        portions: recipe.portions,
        portion_label: recipe.portion_label,
      });

      const loadedIngredients: RecipeIngredientEntry[] = recipe.recipe_ingredients.map((ri) => ({
        ingredient_id: ri.ingredient_id,
        quantity: ri.quantity,
        notes: ri.notes ?? "",
      }));
      setRecipeIngredients(loadedIngredients);

      setPricingMethod(recipe.pricing_method as PricingMethod);

      setPricingValues({
        costProductionPct: recipe.cost_production_pct ?? 50,
        profitPct: recipe.profit_pct ?? 50,
        taxPct: recipe.tax_pct ?? 0,
        fixedCostUsd: recipe.fixed_cost_usd ?? 0,
        fixedProfitUsd: recipe.fixed_profit_usd ?? 0,
        costMultiplier: recipe.cost_multiplier ?? 2,
      });
    }
  }, [recipe, reset]);

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
    };

    const ingredientPayload = recipeIngredients.map((e) => ({
      ingredient_id: e.ingredient_id,
      quantity: e.quantity,
      notes: e.notes ?? null,
    }));

    await updateRecipe.mutateAsync({
      id,
      recipe: recipePayload,
      ingredients: ingredientPayload,
    });

    router.push(`/recetas/${id}`);
  };

  if (loadingRecipe || loadingIngs) {
    return (
      <div className="flex items-center justify-center py-32 text-[#A07050]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C43B2A] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Cargando receta...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href={`/recetas/${id}`}>
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <PageHeader
          title="Editar Receta"
          subtitle="Modifica los ingredientes, cantidades o recalcula precios"
        />
      </div>

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
                placeholder="Descripción breve de la receta"
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
          {recipe && (
            <PriceCalculator
              materialsCostUsd={materialsCostUsd}
              portions={Number(portions) || 1}
              euroRate={euroRate}
              pricingMethod={pricingMethod}
              onMethodChange={setPricingMethod}
              onChange={handleBreakdownChange}
              initialValues={pricingValues}
            />
          )}
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/recetas/${id}`)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={updateRecipe.isPending}
            leftIcon={<ChefHat className="w-4 h-4" />}
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
