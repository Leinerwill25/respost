"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ChefHat,
  Layers,
  DollarSign,
  Filter,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { useRecipes } from "@/hooks/useRecipes";
import { useEuroRate } from "@/hooks/useRates";
import { useIngredients } from "@/hooks/useIngredients";
import { calculatePrice, calculateMaterialsCost } from "@/lib/pricing";
import type { PricingMethod } from "@/types";

const CATEGORIES = [
  "Todas",
  "Tortas",
  "Cupcakes",
  "Galletas",
  "Brownies",
  "Tartas",
  "Postres",
  "Panadería",
  "Otro",
];

const METHOD_LABELS: Record<PricingMethod, string> = {
  percentage: "% Porcentaje",
  fixed: "Precio Fijo",
  multiplication: "× Multiplicación",
};

const METHOD_BADGE_VARIANTS: Record<
  PricingMethod,
  "primary" | "info" | "success"
> = {
  percentage: "primary",
  fixed: "success",
  multiplication: "info",
};

export default function RecetasPage() {
  const { data: recipes = [], isLoading } = useRecipes();
  const { data: rateData } = useEuroRate();
  const { data: ingredients = [] } = useIngredients();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  const euroRate = rateData?.rate ?? 0;

  const ingredientMap = useMemo(() => {
    return new Map(ingredients.map((i) => [i.id, i]));
  }, [ingredients]);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const matchSearch = r.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchCat =
        selectedCategory === "Todas" || r.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [recipes, search, selectedCategory]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recetas"
        subtitle="Gestiona tus recetas y sus costos de producción"
        actions={
          <Link href="/recetas/nueva">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Nueva Receta
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar receta…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-[#A07050] shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${
                  selectedCategory === cat
                    ? "bg-[#C43B2A] text-white shadow-sm"
                    : "bg-[#FAE8E5] text-[#6B3A1F] hover:bg-[#F4C5BC]"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 bg-[#FAE8E5] rounded-[12px] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#FAE8E5] rounded-full flex items-center justify-center mb-4">
            <ChefHat className="w-8 h-8 text-[#C43B2A]" />
          </div>
          {recipes.length === 0 ? (
            <>
              <h3 className="font-display text-xl font-semibold text-[#2C1208] mb-2">
                Aún no tienes recetas
              </h3>
              <p className="text-[#A07050] mb-6 max-w-sm">
                Crea tu primera receta para calcular sus costos y precio de
                venta automáticamente.
              </p>
              <Link href="/recetas/nueva">
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  Crear primera receta
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h3 className="font-display text-xl font-semibold text-[#2C1208] mb-2">
                No se encontraron recetas
              </h3>
              <p className="text-[#A07050] mb-4">
                Prueba cambiando los filtros o la búsqueda.
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("Todas");
                }}
              >
                Limpiar filtros
              </Button>
            </>
          )}
        </div>
      )}

      {/* Recipe grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe) => {
            const method = recipe.pricing_method as PricingMethod;

            return (
              <Link
                key={recipe.id}
                href={`/recetas/${recipe.id}`}
              >
                <Card hover padding="none" className="overflow-hidden h-full">
                  {/* Color strip */}
                  <div className="h-1.5 bg-gradient-to-r from-[#C43B2A] to-[#D4920A]" />

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-semibold text-[#2C1208] leading-tight line-clamp-2">
                        {recipe.name}
                      </h3>
                      {recipe.category && (
                        <Badge variant="default" size="sm">
                          {recipe.category}
                        </Badge>
                      )}
                    </div>

                    {recipe.description && (
                      <p className="text-xs text-[#A07050] line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-[#6B3A1F]">
                      <div className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>
                          {recipe.portions}{" "}
                          {recipe.portion_label ?? "porciones"}
                        </span>
                      </div>
                      <Badge
                        variant={METHOD_BADGE_VARIANTS[method]}
                        size="sm"
                      >
                        {METHOD_LABELS[method]}
                      </Badge>
                    </div>

                    {euroRate > 0 && (
                      <div className="pt-2 border-t border-[#E8D5BE] flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-[#A07050]">
                          <DollarSign className="w-3 h-3" />
                          <span>Ver precio</span>
                        </div>
                        <span className="text-xs text-[#C43B2A] font-medium">
                          Ver detalle →
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-[#A07050] text-center">
          Mostrando {filtered.length} de {recipes.length} recetas
        </p>
      )}
    </div>
  );
}
