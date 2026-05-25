"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShoppingCart,
  Package,
  FileText,
  PenLine,
  ArrowLeft,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { Badge } from "@/components/ui/Badge";

import { useInventory } from "@/hooks/useInventory";
import { useApprovedQuotes } from "@/hooks/useQuotes";
import { useCreateSale } from "@/hooks/useSales";
import { useEuroRate } from "@/hooks/useRates";
import { formatUSD, formatBs, convertToBs } from "@/lib/currency";

type TabKey = "inventory" | "quote" | "manual";

const inventorySchema = z.object({
  inventoryId: z.string().min(1, "Selecciona un producto"),
  quantity: z.number().min(1, "Mínimo 1"),
  clientName: z.string().optional(),
  paymentMethod: z.string().min(1, "Selecciona método de pago"),
  notes: z.string().optional(),
});

const quoteSchema = z.object({
  quoteId: z.string().min(1, "Selecciona un presupuesto"),
  clientName: z.string().optional(),
  paymentMethod: z.string().min(1, "Selecciona método de pago"),
  notes: z.string().optional(),
});

const manualSchema = z.object({
  productDescription: z.string().min(1, "Describe el producto"),
  unitPriceUsd: z.number().min(0.01, "Precio inválido"),
  quantity: z.number().min(1, "Mínimo 1"),
  clientName: z.string().optional(),
  paymentMethod: z.string().min(1, "Selecciona método de pago"),
  notes: z.string().optional(),
});

type InventoryForm = z.infer<typeof inventorySchema>;
type QuoteForm = z.infer<typeof quoteSchema>;
type ManualForm = z.infer<typeof manualSchema>;

const PAYMENT_OPTIONS = [
  { value: "efectivo_usd", label: "Efectivo USD" },
  { value: "efectivo_bs", label: "Efectivo Bs" },
  { value: "transferencia", label: "Transferencia" },
  { value: "pago_movil", label: "Pago Móvil" },
  { value: "zelle", label: "Zelle" },
  { value: "otro", label: "Otro" },
];

function FormInput({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#6B3A1F] mb-1">{label}</label>
      {children}
      {error && <p className="text-[#C43B2A] text-xs mt-1">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-2.5 rounded-[12px] border border-[#E8D5BE] bg-white text-[#2C1208] placeholder-[#A07050] focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] text-sm";

function TotalPreview({
  amountUsd,
  euroRate,
  label = "Total",
}: {
  amountUsd: number;
  euroRate: number;
  label?: string;
}) {
  return (
    <div className="mt-4 p-4 bg-[#FAE8E5] rounded-[12px]">
      <p className="text-xs text-[#A07050] mb-1">{label}</p>
      <CurrencyDisplay amountUsd={amountUsd} euroRate={euroRate} size="lg" />
    </div>
  );
}

function NuevaVentaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedInventoryId = searchParams.get("inventoryId") ?? "";

  const [activeTab, setActiveTab] = useState<TabKey>(
    preselectedInventoryId ? "inventory" : "inventory"
  );

  const { data: inventory = [], isLoading: loadingInv } = useInventory();
  const { data: approvedQuotes = [], isLoading: loadingQuotes } = useApprovedQuotes();
  const { data: rateData } = useEuroRate();
  const createSale = useCreateSale();

  const euroRate = rateData?.rate ?? 1;

  const invForm = useForm<InventoryForm>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      inventoryId: preselectedInventoryId,
      quantity: 1,
      paymentMethod: "efectivo_usd",
    },
  });
  const selectedInvId = invForm.watch("inventoryId");
  const invQty = invForm.watch("quantity") || 1;
  const selectedInvItem = inventory.find((i) => i.id === selectedInvId);
  const invTotal = (selectedInvItem?.sale_price_usd ?? 0) * invQty;

  const quoteForm = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { paymentMethod: "efectivo_usd" },
  });
  const selectedQuoteId = quoteForm.watch("quoteId");
  const selectedQuote = approvedQuotes.find((q) => q.id === selectedQuoteId);
  const quoteTotal = (selectedQuote?.total_price_usd ?? 0);

  const manualForm = useForm<ManualForm>({
    resolver: zodResolver(manualSchema),
    defaultValues: { quantity: 1, unitPriceUsd: 0, paymentMethod: "efectivo_usd" },
  });
  const manualUnitPrice = manualForm.watch("unitPriceUsd") || 0;
  const manualQty = manualForm.watch("quantity") || 1;
  const manualTotal = manualUnitPrice * manualQty;

  useEffect(() => {
    if (selectedQuote) {
      quoteForm.setValue("clientName", selectedQuote.client_name ?? "");
    }
  }, [selectedQuote, quoteForm]);

  const handleInventorySale = invForm.handleSubmit(async (data) => {
    if (!selectedInvItem) return;
    await createSale.mutateAsync({
      sale_type: "inventory",
      finished_inventory_id: data.inventoryId,
      quantity: data.quantity,
      unit_price_usd: selectedInvItem.sale_price_usd,
      unit_cost_usd: selectedInvItem.cost_price_usd,
      euro_rate: euroRate,
      client_name: data.clientName || undefined,
      payment_method: data.paymentMethod,
      notes: data.notes || undefined,
    });
    router.push("/ventas");
  });

  const handleQuoteSale = quoteForm.handleSubmit(async (data) => {
    if (!selectedQuote) return;
    await createSale.mutateAsync({
      sale_type: "quote",
      quote_id: data.quoteId,
      quantity: 1,
      unit_price_usd: selectedQuote.total_price_usd ?? 0,
      euro_rate: euroRate,
      client_name: data.clientName || selectedQuote.client_name || undefined,
      payment_method: data.paymentMethod,
      notes: data.notes || undefined,
    });
    router.push("/ventas");
  });

  const handleManualSale = manualForm.handleSubmit(async (data) => {
    await createSale.mutateAsync({
      sale_type: "manual",
      product_description: data.productDescription,
      quantity: data.quantity,
      unit_price_usd: data.unitPriceUsd,
      euro_rate: euroRate,
      client_name: data.clientName || undefined,
      payment_method: data.paymentMethod,
      notes: data.notes || undefined,
    });
    router.push("/ventas");
  });

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "inventory", label: "Desde Inventario", icon: <Package className="w-4 h-4" /> },
    { key: "quote", label: "Desde Presupuesto", icon: <FileText className="w-4 h-4" /> },
    { key: "manual", label: "Venta Manual", icon: <PenLine className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar Venta"
        subtitle="Elige cómo registrar la venta"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Ventas", href: "/ventas" },
          { label: "Nueva Venta" },
        ]}
        actions={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Volver
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#FAE8E5] rounded-[12px] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-[#C43B2A] shadow-sm"
                : "text-[#6B3A1F] hover:text-[#2C1208]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl">
        {/* TAB A: FROM INVENTORY */}
        {activeTab === "inventory" && (
          <Card>
            <CardHeader
              title="Venta desde Inventario"
              icon={<Package className="w-5 h-5" />}
              subtitle="Selecciona un producto del inventario disponible"
            />

            <form onSubmit={handleInventorySale} className="space-y-4">
              <FormInput
                label="Producto"
                error={invForm.formState.errors.inventoryId?.message}
              >
                <select
                  {...invForm.register("inventoryId")}
                  className={inputClass}
                >
                  <option value="">Seleccionar producto...</option>
                  {loadingInv ? (
                    <option disabled>Cargando...</option>
                  ) : (
                    inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.recipes?.name} — {item.quantity_available} disponibles @ {formatUSD(item.sale_price_usd)}
                      </option>
                    ))
                  )}
                </select>
              </FormInput>

              {selectedInvItem && (
                <div className="p-3 bg-[#FAE8E5] rounded-[12px] text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B3A1F]">Precio unitario:</span>
                    <div className="text-right">
                      <div className="font-semibold text-[#2C1208]">
                        {formatUSD(selectedInvItem.sale_price_usd)}
                      </div>
                      <div className="text-xs text-[#A07050]">
                        {formatBs(convertToBs(selectedInvItem.sale_price_usd, euroRate))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[#6B3A1F]">Stock disponible:</span>
                    <Badge variant={selectedInvItem.quantity_available > 0 ? "success" : "danger"}>
                      {selectedInvItem.quantity_available} {selectedInvItem.recipes?.portion_label || "und"}
                    </Badge>
                  </div>
                </div>
              )}

              <FormInput label="Cantidad" error={invForm.formState.errors.quantity?.message}>
                <input
                  type="number"
                  min={1}
                  max={selectedInvItem?.quantity_available ?? 999}
                  {...invForm.register("quantity", { valueAsNumber: true })}
                  className={inputClass}
                />
                {selectedInvItem && (
                  <p className="text-xs text-[#A07050] mt-1">
                    Máximo: {selectedInvItem.quantity_available}
                  </p>
                )}
              </FormInput>

              <FormInput label="Cliente (opcional)" error={undefined}>
                <input
                  type="text"
                  placeholder="Nombre del cliente..."
                  {...invForm.register("clientName")}
                  className={inputClass}
                />
              </FormInput>

              <FormInput
                label="Método de Pago"
                error={invForm.formState.errors.paymentMethod?.message}
              >
                <select {...invForm.register("paymentMethod")} className={inputClass}>
                  {PAYMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormInput>

              <FormInput label="Notas (opcional)" error={undefined}>
                <textarea
                  rows={2}
                  placeholder="Observaciones..."
                  {...invForm.register("notes")}
                  className={`${inputClass} resize-none`}
                />
              </FormInput>

              <TotalPreview amountUsd={invTotal} euroRate={euroRate} label="Total a cobrar" />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={createSale.isPending}
                leftIcon={<Receipt className="w-5 h-5" />}
              >
                Registrar Venta
              </Button>
            </form>
          </Card>
        )}

        {/* TAB B: FROM QUOTE */}
        {activeTab === "quote" && (
          <Card>
            <CardHeader
              title="Venta desde Presupuesto"
              icon={<FileText className="w-5 h-5" />}
              subtitle="Convierte un presupuesto aprobado en venta"
            />

            <form onSubmit={handleQuoteSale} className="space-y-4">
              <FormInput
                label="Presupuesto Aprobado"
                error={quoteForm.formState.errors.quoteId?.message}
              >
                <select {...quoteForm.register("quoteId")} className={inputClass}>
                  <option value="">Seleccionar presupuesto...</option>
                  {loadingQuotes ? (
                    <option disabled>Cargando...</option>
                  ) : approvedQuotes.length === 0 ? (
                    <option disabled>Sin presupuestos aprobados</option>
                  ) : (
                    approvedQuotes.map((q) => (
                      <option key={q.id} value={q.id}>
                        #{q.id.slice(0, 8)} — {q.client_name || "Sin cliente"} — {formatUSD(q.total_price_usd ?? 0)}
                      </option>
                    ))
                  )}
                </select>
              </FormInput>

              {selectedQuote && (
                <div className="p-4 bg-[#FAE8E5] rounded-[12px] space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B3A1F]">Cliente:</span>
                    <span className="font-medium text-[#2C1208]">
                      {selectedQuote.client_name || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B3A1F]">Título:</span>
                    <span className="font-medium text-[#2C1208]">
                      {selectedQuote.title || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B3A1F]">Total presupuesto:</span>
                    <div className="text-right">
                      <div className="font-semibold text-[#2C1208]">
                        {formatUSD(selectedQuote.total_price_usd ?? 0)}
                      </div>
                      <div className="text-xs text-[#A07050]">
                        {formatBs(convertToBs(selectedQuote.total_price_usd ?? 0, euroRate))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B3A1F]">Estado:</span>
                    <Badge variant="success">Aprobado</Badge>
                  </div>
                </div>
              )}

              <FormInput label="Cliente (override opcional)" error={undefined}>
                <input
                  type="text"
                  placeholder="Nombre del cliente..."
                  {...quoteForm.register("clientName")}
                  className={inputClass}
                />
              </FormInput>

              <FormInput
                label="Método de Pago"
                error={quoteForm.formState.errors.paymentMethod?.message}
              >
                <select {...quoteForm.register("paymentMethod")} className={inputClass}>
                  {PAYMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormInput>

              <FormInput label="Notas (opcional)" error={undefined}>
                <textarea
                  rows={2}
                  placeholder="Observaciones..."
                  {...quoteForm.register("notes")}
                  className={`${inputClass} resize-none`}
                />
              </FormInput>

              <TotalPreview amountUsd={quoteTotal} euroRate={euroRate} label="Total a cobrar" />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={createSale.isPending}
                leftIcon={<Receipt className="w-5 h-5" />}
              >
                Registrar Venta
              </Button>
            </form>
          </Card>
        )}

        {/* TAB C: MANUAL */}
        {activeTab === "manual" && (
          <Card>
            <CardHeader
              title="Venta Manual"
              icon={<PenLine className="w-5 h-5" />}
              subtitle="Registra una venta sin asociarla al inventario"
            />

            <form onSubmit={handleManualSale} className="space-y-4">
              <FormInput
                label="Descripción del Producto"
                error={manualForm.formState.errors.productDescription?.message}
              >
                <input
                  type="text"
                  placeholder="Ej: Torta de chocolate personalizada"
                  {...manualForm.register("productDescription")}
                  className={inputClass}
                />
              </FormInput>

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Precio Unitario (USD)"
                  error={manualForm.formState.errors.unitPriceUsd?.message}
                >
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    {...manualForm.register("unitPriceUsd", { valueAsNumber: true })}
                    className={inputClass}
                  />
                </FormInput>
                <FormInput
                  label="Cantidad"
                  error={manualForm.formState.errors.quantity?.message}
                >
                  <input
                    type="number"
                    min={1}
                    {...manualForm.register("quantity", { valueAsNumber: true })}
                    className={inputClass}
                  />
                </FormInput>
              </div>

              {manualUnitPrice > 0 && (
                <div className="p-3 bg-[#FAE8E5] rounded-[12px] text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B3A1F]">Equivalente en Bs:</span>
                    <span className="font-medium text-[#2C1208]">
                      {formatBs(convertToBs(manualUnitPrice, euroRate))} / und
                    </span>
                  </div>
                </div>
              )}

              <FormInput label="Cliente (opcional)" error={undefined}>
                <input
                  type="text"
                  placeholder="Nombre del cliente..."
                  {...manualForm.register("clientName")}
                  className={inputClass}
                />
              </FormInput>

              <FormInput
                label="Método de Pago"
                error={manualForm.formState.errors.paymentMethod?.message}
              >
                <select {...manualForm.register("paymentMethod")} className={inputClass}>
                  {PAYMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormInput>

              <FormInput label="Notas (opcional)" error={undefined}>
                <textarea
                  rows={2}
                  placeholder="Observaciones..."
                  {...manualForm.register("notes")}
                  className={`${inputClass} resize-none`}
                />
              </FormInput>

              <TotalPreview amountUsd={manualTotal} euroRate={euroRate} label="Total a cobrar" />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={createSale.isPending}
                leftIcon={<Receipt className="w-5 h-5" />}
              >
                Registrar Venta
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function NuevaVentaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#A07050]">Cargando...</div>}>
      <NuevaVentaContent />
    </Suspense>
  );
}
