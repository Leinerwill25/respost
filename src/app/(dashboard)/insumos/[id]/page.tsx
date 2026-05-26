"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  SlidersHorizontal,
  Package,
  Tag,
  DollarSign,
  Archive,
  Bell,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { StockAdjustModal } from "@/components/ingredients/StockAdjustModal";
import {
  useIngredient,
  useIngredientMovements,
} from "@/hooks/useIngredients";
import { useEuroRate } from "@/hooks/useRates";
import {
  formatUSD,
  formatIngredientQuantity,
  formatRelativeDate,
} from "@/lib/currency";

const REASON_LABELS: Record<string, string> = {
  compra: "Compra",
  produccion: "Producción",
  merma: "Merma",
  ajuste: "Ajuste",
};

const REASON_COLORS: Record<
  string,
  "success" | "info" | "danger" | "warning"
> = {
  compra: "success",
  produccion: "info",
  merma: "danger",
  ajuste: "warning",
};

function getPresentationLabels(unit: string) {
  switch (unit) {
    case "g":
    case "kg":
      return { size: "Tamaño empaque", price: "Precio empaque" };
    case "ml":
    case "l":
      return { size: "Contenido envase", price: "Precio envase" };
    case "unidades":
      return { size: "Contenido caja", price: "Precio caja" };
    default:
      return { size: "Tamaño presentación", price: "Precio presentación" };
  }
}

export default function IngredientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [stockModalOpen, setStockModalOpen] = useState(false);

  const { data: ingredient, isLoading } = useIngredient(id);
  const { data: movements = [], isLoading: loadingMovements } =
    useIngredientMovements(id);
  const { data: rateData } = useEuroRate();

  const euroRate = rateData?.rate ?? 0;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-32 text-[#A07050]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#C43B2A] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Cargando insumo...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!ingredient) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 bg-[#FAE8E5] rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-[#C43B2A]" />
          </div>
          <p className="font-display text-xl font-bold text-[#2C1208] mb-2">
            Insumo no encontrado
          </p>
          <p className="text-sm text-[#A07050] mb-4">
            Este insumo no existe o fue eliminado.
          </p>
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.push("/insumos")}
          >
            Volver a Insumos
          </Button>
        </div>
      </div>
    );
  }

  const unitPrice =
    ingredient.price_usd > 0 && ingredient.package_size > 0
      ? ingredient.price_usd / ingredient.package_size
      : 0;

  const terms = getPresentationLabels(ingredient.unit);

  const isLowStock =
    ingredient.min_stock_alert > 0 &&
    ingredient.stock_quantity <= ingredient.min_stock_alert;

  const stockProgress =
    ingredient.min_stock_alert > 0
      ? Math.min(
          (ingredient.stock_quantity / (ingredient.min_stock_alert * 2)) * 100,
          100
        )
      : 50;

  const categoryName = (ingredient as unknown as { ingredient_categories?: { name: string } | null })
    ?.ingredient_categories?.name;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <PageHeader
        title={ingredient.name}
        subtitle={categoryName ?? "Sin categoría"}
        breadcrumb={[
          { label: "Insumos", href: "/insumos" },
          { label: ingredient.name },
        ]}
        actions={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push("/insumos")}
            >
              Volver
            </Button>
            <Button
              variant="primary"
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              onClick={() => setStockModalOpen(true)}
            >
              Ajustar Stock
            </Button>
          </div>
        }
      />

      {/* Stock Alert Banner */}
      {isLowStock && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-[#FFF3E0] border border-[#FFCC80] rounded-[12px]">
          <div className="flex items-start sm:items-center gap-3 flex-1">
            <AlertTriangle className="w-5 h-5 text-[#E65100] flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm font-medium text-[#E65100]">
              ¡Stock bajo! Tienes{" "}
              <strong>
                {ingredient.stock_quantity} {ingredient.unit}
              </strong>{" "}
              y el mínimo es{" "}
              <strong>
                {ingredient.min_stock_alert} {ingredient.unit}
              </strong>
              .
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full sm:w-auto border-[#FFCC80] text-[#E65100] hover:bg-[#FFF3E0] sm:ml-auto"
            onClick={() => setStockModalOpen(true)}
          >
            Reponer
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info + Stock */}
        <div className="lg:col-span-1 space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader
              title="Información"
              icon={<Package className="w-5 h-5" />}
            />

            <div className="space-y-4">
              {/* Category */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#A07050]">
                  <Tag className="w-4 h-4" />
                  Categoría
                </div>
                {categoryName ? (
                  <Badge variant="default">{categoryName}</Badge>
                ) : (
                  <span className="text-sm text-[#A07050]">Sin categoría</span>
                )}
              </div>

              <div className="h-px bg-[#E8D5BE]" />

              {/* Package Size */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#A07050]">
                  <Archive className="w-4 h-4" />
                  {terms.size}
                </div>
                <span className="text-sm font-semibold text-[#2C1208]">
                  {ingredient.package_size} {ingredient.unit}
                </span>
              </div>

              {/* Price per package */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#A07050]">
                  <DollarSign className="w-4 h-4" />
                  {terms.price}
                </div>
                <CurrencyDisplay
                  amountUsd={ingredient.price_usd}
                  euroRate={euroRate}
                  size="sm"
                  className="items-end"
                />
              </div>

              {/* Unit price */}
              {unitPrice > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[#A07050]">
                    <DollarSign className="w-4 h-4" />
                    Precio unitario
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#C43B2A]">
                      {formatUSD(unitPrice)}/{ingredient.unit}
                    </p>
                  </div>
                </div>
              )}

              {/* Min alert */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#A07050]">
                  <Bell className="w-4 h-4" />
                  Alerta mínima
                </div>
                <span className="text-sm font-semibold text-[#2C1208]">
                  {ingredient.min_stock_alert > 0
                    ? `${ingredient.min_stock_alert} ${ingredient.unit}`
                    : "Sin alerta"}
                </span>
              </div>

              {ingredient.notes && (
                <>
                  <div className="h-px bg-[#E8D5BE]" />
                  <div>
                    <div className="flex items-center gap-2 text-sm text-[#A07050] mb-1">
                      <FileText className="w-4 h-4" />
                      Notas
                    </div>
                    <p className="text-sm text-[#6B3A1F] bg-[#FAE8E5] rounded-[8px] p-3">
                      {ingredient.notes}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Stock Status Card */}
          <Card>
            <CardHeader
              title="Stock Actual"
              icon={<Archive className="w-5 h-5" />}
            />

            <div className="space-y-4">
              {/* Big stock number */}
              <div className="text-center py-2">
                <p
                  className={`font-display text-4xl font-bold ${
                    isLowStock ? "text-[#E65100]" : "text-[#2C1208]"
                  }`}
                >
                  {ingredient.stock_quantity.toLocaleString("es-VE")}
                </p>
                <p className="text-sm text-[#A07050] mt-1">{ingredient.unit}</p>
                {isLowStock && (
                  <div className="mt-2">
                    <Badge variant="danger" dot>
                      Stock bajo
                    </Badge>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {ingredient.min_stock_alert > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs text-[#A07050] mb-2">
                    <span>0 {ingredient.unit}</span>
                    <span>
                      Mín: {ingredient.min_stock_alert} {ingredient.unit}
                    </span>
                  </div>
                  <div className="h-3 bg-[#FAE8E5] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isLowStock
                          ? "bg-[#C43B2A]"
                          : stockProgress < 60
                          ? "bg-amber-400"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${stockProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-[#A07050] mt-2">
                    {stockProgress.toFixed(0)}% del nivel seguro
                  </p>
                </div>
              )}

              {/* Value in stock */}
              {unitPrice > 0 && (
                <div className="p-3 bg-[#FAE8E5] rounded-[10px]">
                  <p className="text-xs text-[#A07050] mb-1">
                    Valor del stock en inventario
                  </p>
                  <CurrencyDisplay
                    amountUsd={unitPrice * ingredient.stock_quantity}
                    euroRate={euroRate}
                    size="md"
                  />
                </div>
              )}

              <Button
                variant="primary"
                className="w-full"
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                onClick={() => setStockModalOpen(true)}
              >
                Ajustar Stock
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Movement History */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="p-6 border-b border-[#E8D5BE]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-[#2C1208]">
                    Historial de Movimientos
                  </h3>
                  <p className="text-sm text-[#A07050] mt-0.5">
                    Últimos {movements.length} registros
                  </p>
                </div>
                <Badge variant="default">{movements.length} movs.</Badge>
              </div>
            </div>

            {loadingMovements ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-[#C43B2A] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : movements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 bg-[#FAE8E5] rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-[#C43B2A]" />
                </div>
                <p className="font-semibold text-[#2C1208] mb-1">
                  Sin movimientos aún
                </p>
                <p className="text-sm text-[#A07050]">
                  Registra una compra o ajuste para comenzar el historial
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F5EDE0] border-b border-[#E8D5BE]">
                      <th className="text-left py-3 px-5 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">
                        Fecha
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">
                        Tipo
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">
                        Cantidad
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide hidden sm:table-cell">
                        Motivo
                      </th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide hidden md:table-cell">
                        Notas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8D5BE]">
                    {movements.map((mov) => {
                      const isIn = mov.movement_type === "IN";
                      return (
                        <tr
                          key={mov.id}
                          className="hover:bg-[#FDF3F1] transition-colors"
                        >
                          {/* Date */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#A07050] flex-shrink-0" />
                              <div>
                                <p className="text-sm text-[#2C1208] font-medium">
                                  {new Date(mov.created_at).toLocaleDateString(
                                    "es-VE",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </p>
                                <p className="text-xs text-[#A07050]">
                                  {formatRelativeDate(mov.created_at)}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                  isIn
                                    ? "bg-green-100"
                                    : "bg-red-100"
                                }`}
                              >
                                {isIn ? (
                                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                                ) : (
                                  <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                                )}
                              </div>
                              <Badge
                                variant={isIn ? "success" : "danger"}
                                size="sm"
                              >
                                {isIn ? "Entrada" : "Salida"}
                              </Badge>
                            </div>
                          </td>

                          {/* Quantity */}
                          <td className="py-3.5 px-4 text-right">
                            <span
                              className={`text-sm font-bold ${
                                isIn ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isIn ? "+" : "−"}
                              {formatIngredientQuantity(
                                mov.quantity,
                                ingredient.unit as
                                  | "g"
                                  | "kg"
                                  | "ml"
                                  | "l"
                                  | "unidades"
                              )}
                            </span>
                          </td>

                          {/* Reason */}
                          <td className="py-3.5 px-4 hidden sm:table-cell">
                            <Badge
                              variant={
                                REASON_COLORS[mov.reason ?? "ajuste"] ??
                                "default"
                              }
                              size="sm"
                            >
                              {REASON_LABELS[mov.reason ?? "ajuste"] ??
                                mov.reason}
                            </Badge>
                          </td>

                          {/* Notes */}
                          <td className="py-3.5 px-5 hidden md:table-cell">
                            <span className="text-sm text-[#A07050] truncate max-w-[200px] block">
                              {mov.notes ?? "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        ingredientId={ingredient.id}
        ingredientName={ingredient.name}
        currentStock={ingredient.stock_quantity}
        unit={ingredient.unit}
        priceUsd={ingredient.price_usd}
        packageSize={ingredient.package_size}
        euroRate={euroRate}
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
      />
    </div>
  );
}
