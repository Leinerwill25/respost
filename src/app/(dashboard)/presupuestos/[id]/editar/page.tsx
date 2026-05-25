"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, FileText, Calendar, User, Phone } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { QuoteBuilder } from "@/components/quotes/QuoteBuilder";
import { PriceCalculator } from "@/components/recipes/PriceCalculator";
import { useIngredients } from "@/hooks/useIngredients";
import { useEuroRate } from "@/hooks/useRates";
import { useQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { calculatePrice } from "@/lib/pricing";
import { convertToBs } from "@/lib/currency";
import type { QuoteSection, PricingMethod, PriceBreakdown } from "@/types";

const schema = z.object({
  client_name: z.string().min(1, "El nombre del cliente es obligatorio"),
  client_contact: z.string().optional().nullable(),
  title: z.string().min(1, "El título del presupuesto es obligatorio"),
  quote_type: z.enum(["postre", "combo"]),
  portions: z.number().min(1, "Debe ser al menos 1 porción"),
  valid_until: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export default function EditarPresupuestoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: quote, isLoading: loadingQuote } = useQuote(id);
  const { data: ingredientsData, isLoading: loadingIngs } = useIngredients();
  const { data: rateData, isLoading: loadingRate } = useEuroRate();
  const updateQuoteMutation = useUpdateQuote();

  const euroRate = rateData?.rate ?? 1;
  const ingredients = ingredientsData ?? [];

  const [sections, setSections] = useState<QuoteSection[]>([]);
  const [pricingMethod, setPricingMethod] = useState<PricingMethod>("percentage");
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);

  const [calculatorVals, setCalculatorVals] = useState({
    costProductionPct: 50,
    profitPct: 50,
    fixedCostUsd: 0,
    fixedProfitUsd: 0,
    costMultiplier: 2,
    taxPct: 0,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const quoteType = watch("quote_type");
  const portions = watch("portions");

  useEffect(() => {
    if (quote) {
      reset({
        client_name: quote.client_name ?? "",
        client_contact: quote.client_contact ?? "",
        title: quote.title ?? "",
        quote_type: quote.quote_type as "postre" | "combo",
        portions: quote.portions ?? 1,
        valid_until: quote.valid_until ? quote.valid_until.substring(0, 10) : "",
        notes: quote.notes ?? "",
      });

      const loadedSections = (typeof quote.sections === "string"
        ? JSON.parse(quote.sections)
        : quote.sections) as QuoteSection[] ?? [];
      setSections(loadedSections);

      setPricingMethod(quote.pricing_method as PricingMethod);

      setCalculatorVals({
        costProductionPct: quote.cost_production_pct ?? 50,
        profitPct: quote.profit_pct ?? 50,
        fixedCostUsd: quote.fixed_cost_usd ?? 0,
        fixedProfitUsd: quote.fixed_profit_usd ?? 0,
        costMultiplier: quote.cost_multiplier ?? 2,
        taxPct: quote.tax_pct ?? 0,
      });
    }
  }, [quote, reset]);

  const materialsCostUsd = sections
    .flatMap((s) => s.items)
    .reduce((sum, item) => sum + (item.price_usd || 0), 0);

  useEffect(() => {
    const breakdown = calculatePrice(pricingMethod, {
      materialsCostUsd,
      portions: portions || 1,
      taxPct: calculatorVals.taxPct,
      costProductionPct: calculatorVals.costProductionPct,
      profitPct: calculatorVals.profitPct,
      fixedCostUsd: calculatorVals.fixedCostUsd,
      fixedProfitUsd: calculatorVals.fixedProfitUsd,
      costMultiplier: calculatorVals.costMultiplier,
    });
    setPriceBreakdown(breakdown);
  }, [materialsCostUsd, portions, pricingMethod, calculatorVals]);

  const onSubmit = async (data: FormData) => {
    if (sections.length === 0) {
      alert("Por favor agrega al menos una sección con ítems al presupuesto");
      return;
    }

    if (!priceBreakdown) return;

    const updates = {
      title: data.title,
      client_name: data.client_name,
      client_contact: data.client_contact || null,
      quote_type: data.quote_type,
      sections: sections as any,
      portions: data.portions,
      valid_until: data.valid_until || null,
      notes: data.notes || null,
      pricing_method: pricingMethod,
      subtotal_materials_usd: materialsCostUsd,
      euro_rate: euroRate,
      cost_production_pct: pricingMethod === "percentage" ? calculatorVals.costProductionPct : null,
      profit_pct: pricingMethod === "percentage" ? calculatorVals.profitPct : null,
      fixed_cost_usd: pricingMethod === "fixed" ? calculatorVals.fixedCostUsd : null,
      fixed_profit_usd: pricingMethod === "fixed" ? calculatorVals.fixedProfitUsd : null,
      cost_multiplier: pricingMethod === "multiplication" ? calculatorVals.costMultiplier : null,
      tax_pct: calculatorVals.taxPct,
      total_price_usd: priceBreakdown.salePriceUsd,
      price_per_portion_usd: priceBreakdown.pricePerPortionUsd,
      total_price_bs: convertToBs(priceBreakdown.salePriceUsd, euroRate),
    };

    try {
      await updateQuoteMutation.mutateAsync({ id, updates });
      router.push(`/presupuestos/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingQuote || loadingIngs || loadingRate) {
    return (
      <div className="flex items-center justify-center py-32 text-[#A07050]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C43B2A] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Cargando presupuesto...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href={`/presupuestos/${id}`}>
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <PageHeader
          title="Editar Presupuesto"
          subtitle="Modifica la cotización o recalcula precios con otros métodos"
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Info + Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <Card>
            <div className="p-4 border-b border-[#E8D5BE] bg-[#F5EDE0] rounded-t-[12px]">
              <h3 className="font-display font-semibold text-[#2C1208] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C43B2A]" />
                Información del Cliente y Evento
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre del Cliente"
                  placeholder="Ej. María Delgado"
                  {...register("client_name")}
                  error={errors.client_name?.message}
                  leftIcon={<User className="w-4 h-4 text-[#A07050]" />}
                />
                <Input
                  label="Contacto (Teléfono / Email)"
                  placeholder="Ej. +58 412-1234567"
                  {...register("client_contact")}
                  error={errors.client_contact?.message}
                  leftIcon={<Phone className="w-4 h-4 text-[#A07050]" />}
                />
              </div>

              <Input
                label="Título del Evento / Presupuesto"
                placeholder="Ej. Torta de Bodas Vintage - 3 Pisos"
                {...register("title")}
                error={errors.title?.message}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B3A1F] mb-1.5 uppercase">
                    Tipo de Presupuesto
                  </label>
                  <select
                    {...register("quote_type")}
                    className="w-full text-sm border border-[#E8D5BE] rounded-[8px] px-3 py-2.5 bg-white text-[#2C1208] focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A]"
                  >
                    <option value="postre">Postre Individual</option>
                    <option value="combo">Combo / Mesa de Dulces</option>
                  </select>
                </div>

                <Input
                  label="Porciones"
                  type="number"
                  placeholder="Ej. 24"
                  {...register("portions", { valueAsNumber: true })}
                  error={errors.portions?.message}
                />

                <Input
                  label="Válido hasta"
                  type="date"
                  {...register("valid_until")}
                  error={errors.valid_until?.message}
                  leftIcon={<Calendar className="w-4 h-4 text-[#A07050]" />}
                />
              </div>
            </div>
          </Card>

          {/* Builder */}
          <Card>
            <div className="p-4 border-b border-[#E8D5BE] bg-[#F5EDE0] rounded-t-[12px]">
              <h3 className="font-display font-semibold text-[#2C1208]">
                Estructura del Presupuesto (Secciones e Ítems)
              </h3>
              <p className="text-xs text-[#A07050] mt-0.5">
                Organiza los ingredientes y extras en secciones. Puedes reordenarlas arrastrándolas.
              </p>
            </div>
            <div className="p-4">
              <QuoteBuilder
                value={sections}
                onChange={setSections}
                quoteType={quoteType}
                ingredients={ingredients}
                euroRate={euroRate}
              />
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <div className="p-4 border-b border-[#E8D5BE] bg-[#F5EDE0] rounded-t-[12px]">
              <h3 className="font-display font-semibold text-[#2C1208]">Notas adicionales</h3>
            </div>
            <div className="p-4">
              <textarea
                placeholder="Ingresa notas o condiciones especiales del presupuesto"
                rows={3}
                {...register("notes")}
                className="w-full text-sm border border-[#E8D5BE] rounded-[8px] p-3 text-[#2C1208] focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] placeholder:text-[#A07050]/50"
              />
            </div>
          </Card>
        </div>

        {/* Right column: Price Calculator + Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <div className="p-4 border-b border-[#E8D5BE] bg-[#F5EDE0] rounded-t-[12px]">
              <h3 className="font-display font-semibold text-[#2C1208]">Cálculo de Precios</h3>
            </div>
            <div className="p-4">
              <PriceCalculator
                materialsCostUsd={materialsCostUsd}
                portions={portions || 1}
                euroRate={euroRate}
                pricingMethod={pricingMethod}
                onMethodChange={setPricingMethod}
                onChange={(breakdown) => {
                  setPriceBreakdown(breakdown);
                  const b = breakdown as any;
                  setCalculatorVals((prev) => ({
                    ...prev,
                    costProductionPct: b.costProductionPct ?? prev.costProductionPct,
                    profitPct: b.profitPct ?? prev.profitPct,
                    fixedCostUsd: b.fixedCostUsd ?? prev.fixedCostUsd,
                    fixedProfitUsd: b.fixedProfitUsd ?? prev.fixedProfitUsd,
                    costMultiplier: b.costMultiplier ?? prev.costMultiplier,
                    taxPct: b.taxPct ?? prev.taxPct,
                  }));
                }}
                initialValues={calculatorVals}
                layout="sidebar"
              />

              {/* Submit */}
              <div className="mt-6">
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
