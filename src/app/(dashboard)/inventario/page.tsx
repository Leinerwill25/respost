"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Boxes,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

import { useAllInventory } from "@/hooks/useInventory";
import { useEuroRate } from "@/hooks/useRates";
import { formatUSD, formatBs, convertToBs } from "@/lib/currency";

export default function InventarioPage() {
  const { data: inventory = [], isLoading } = useAllInventory();
  const { data: rateData } = useEuroRate();
  const euroRate = rateData?.rate ?? 1;

  const summary = useMemo(() => {
    const totalProducts = inventory.length;
    const totalUnits = inventory.reduce((s, i) => s + i.quantity_available, 0);
    const totalValueUsd = inventory.reduce(
      (s, i) => s + i.quantity_available * i.sale_price_usd,
      0
    );
    return { totalProducts, totalUnits, totalValueUsd };
  }, [inventory]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario de Productos"
        subtitle="Control de productos terminados disponibles para venta"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Inventario" }]}
        actions={
          <Link href="/produccion">
            <Button variant="primary" leftIcon={<Package className="w-4 h-4" />}>
              Registrar Producción
            </Button>
          </Link>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FAE8E5] rounded-[10px] flex items-center justify-center text-[#C43B2A]">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#A07050]">Total Productos</p>
              <p className="text-2xl font-bold text-[#2C1208]">{summary.totalProducts}</p>
              <p className="text-xs text-[#A07050]">tipos de productos</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#E3F0FF] rounded-[10px] flex items-center justify-center text-[#1565C0]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#A07050]">Total Unidades</p>
              <p className="text-2xl font-bold text-[#2C1208]">
                {summary.totalUnits.toLocaleString("es-VE")}
              </p>
              <p className="text-xs text-[#A07050]">unidades disponibles</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#EDF7EE] rounded-[10px] flex items-center justify-center text-[#2E7D32]">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#A07050]">Valor Total Inventario</p>
              <CurrencyDisplay amountUsd={summary.totalValueUsd} euroRate={euroRate} size="sm" />
            </div>
          </div>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card padding="none">
        <div className="p-6 pb-0">
          <CardHeader
            title="Productos Terminados"
            icon={<Package className="w-5 h-5" />}
            subtitle={`${inventory.length} productos registrados`}
          />
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-[#A07050]">
            <div className="animate-spin w-8 h-8 border-2 border-[#C43B2A] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm">Cargando inventario...</p>
          </div>
        ) : inventory.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-[#A07050] opacity-40 mx-auto mb-3" />
            <p className="text-[#6B3A1F] font-semibold">Sin productos en inventario</p>
            <p className="text-[#A07050] text-sm mt-1 mb-4">
              Registra una producción para agregar productos
            </p>
            <Link href="/produccion">
              <Button variant="primary">Registrar Producción</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8D5BE] bg-[#F5EDE0]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Producto</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Disponible</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Precio Venta</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide hidden md:table-cell">Costo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide hidden sm:table-cell">Margen</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide hidden sm:table-cell">Valor Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Acción</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const margin =
                    item.sale_price_usd > 0
                      ? ((item.sale_price_usd - item.cost_price_usd) / item.sale_price_usd) * 100
                      : 0;
                  const stockValue = item.quantity_available * item.sale_price_usd;
                  const isAvailable = item.quantity_available > 0;

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[#E8D5BE] last:border-0 hover:bg-[#FDF3F1] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.recipes?.image_url ? (
                            <img
                              src={item.recipes.image_url}
                              alt={item.recipes?.name}
                              className="w-10 h-10 rounded-[8px] object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-[#FAE8E5] rounded-[8px] flex items-center justify-center text-[#C43B2A]">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-[#2C1208]">
                              {item.recipes?.name || "Sin nombre"}
                            </div>
                            {item.recipes?.category && (
                              <div className="text-xs text-[#A07050]">{item.recipes.category}</div>
                            )}
                            <div className="text-xs text-[#6B3A1F]">
                              Tasa producción: {(item.euro_rate_at_production ?? 0).toFixed(2)} Bs
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <Badge variant={isAvailable ? "success" : "danger"} dot>
                          {item.quantity_available}{" "}
                          {item.recipes?.portion_label || "und"}
                        </Badge>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="font-semibold text-[#2C1208]">
                          {formatUSD(item.sale_price_usd)}
                        </div>
                        <div className="text-xs text-[#A07050] hidden sm:block">
                          {formatBs(convertToBs(item.sale_price_usd, euroRate))}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right hidden md:table-cell">
                        <div className="text-[#6B3A1F]">{formatUSD(item.cost_price_usd)}</div>
                        <div className="text-xs text-[#A07050]">
                          {formatBs(convertToBs(item.cost_price_usd, euroRate))}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right hidden sm:table-cell">
                        <Badge
                          variant={margin >= 40 ? "success" : margin >= 20 ? "warning" : "danger"}
                        >
                          {margin.toFixed(1)}%
                        </Badge>
                      </td>

                      <td className="px-4 py-4 text-right hidden sm:table-cell">
                        <div className="font-medium text-[#2C1208]">{formatUSD(stockValue)}</div>
                        <div className="text-xs text-[#A07050]">
                          {formatBs(convertToBs(stockValue, euroRate))}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <Link href={`/ventas/nueva?inventoryId=${item.id}`}>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={!isAvailable}
                            leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
                          >
                            Vender
                          </Button>
                        </Link>
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
  );
}
