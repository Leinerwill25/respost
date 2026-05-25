"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Plus,
  Calendar,
  TrendingUp,
  DollarSign,
  Percent,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

import { useSales } from "@/hooks/useSales";
import { useEuroRate } from "@/hooks/useRates";
import { formatUSD, formatBs, convertToBs, formatRelativeDate } from "@/lib/currency";

type DateFilter = "this_month" | "last_30" | "custom";

const PAYMENT_LABELS: Record<string, { label: string; variant: "success" | "info" | "primary" | "warning" | "default" }> = {
  efectivo_usd: { label: "Efectivo (Dólares)", variant: "success" },
  efectivo_bs: { label: "Efectivo (Bolívares)", variant: "warning" },
  transferencia: { label: "Transferencia (Bolívares)", variant: "info" },
  pago_movil: { label: "Pago móvil (Bolívares)", variant: "info" },
  zelle: { label: "Zelle (Dólares)", variant: "primary" },
  otro: { label: "Otro", variant: "default" },
};

export default function VentasPage() {
  const { data: sales = [], isLoading } = useSales();
  const { data: rateData } = useEuroRate();
  const euroRate = rateData?.rate ?? 1;

  const [dateFilter, setDateFilter] = useState<DateFilter>("this_month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter((sale) => {
      const saleDate = new Date(sale.sold_at);
      if (dateFilter === "this_month") {
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      } else if (dateFilter === "last_30") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return saleDate >= thirtyDaysAgo;
      } else if (dateFilter === "custom" && customStart && customEnd) {
        const start = new Date(customStart);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59);
        return saleDate >= start && saleDate <= end;
      }
      return true;
    });
  }, [sales, dateFilter, customStart, customEnd]);

  const summary = useMemo(() => {
    const totalUsd = filteredSales.reduce((s, v) => s + (v.total_price_usd ?? 0), 0);
    const totalBs = filteredSales.reduce((s, v) => s + (v.total_price_bs ?? 0), 0);
    const totalProfit = filteredSales.reduce((s, v) => s + (v.profit_usd ?? 0), 0);
    const avgMargin =
      filteredSales.length > 0
        ? filteredSales.reduce((s, v) => {
            const margin =
              (v.total_price_usd ?? 0) > 0
                ? ((v.profit_usd ?? 0) / (v.total_price_usd ?? 1)) * 100
                : 0;
            return s + margin;
          }, 0) / filteredSales.length
        : 0;
    return { totalUsd, totalBs, totalProfit, avgMargin };
  }, [filteredSales]);

  const filterButtons: { key: DateFilter; label: string }[] = [
    { key: "this_month", label: "Este mes" },
    { key: "last_30", label: "Últimos 30 días" },
    { key: "custom", label: "Personalizado" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ventas"
        subtitle="Historial y análisis de ventas"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Ventas" }]}
        actions={
          <Link href="/ventas/nueva">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Registrar Venta
            </Button>
          </Link>
        }
      />

      {/* Date Filters */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center gap-3">
          <Calendar className="w-4 h-4 text-[#A07050]" />
          <span className="text-sm text-[#6B3A1F] font-medium">Período:</span>
          <div className="flex gap-2">
            {filterButtons.map((f) => (
              <button
                key={f.key}
                onClick={() => setDateFilter(f.key)}
                className={`px-3 py-1.5 rounded-[8px] text-sm font-medium transition-colors ${
                  dateFilter === f.key
                    ? "bg-[#C43B2A] text-white"
                    : "bg-[#FAE8E5] text-[#6B3A1F] hover:bg-[#F4C5BC]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {dateFilter === "custom" && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 rounded-[8px] border border-[#E8D5BE] bg-white text-[#2C1208] text-sm focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A]"
              />
              <span className="text-[#A07050] text-sm">—</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 rounded-[8px] border border-[#E8D5BE] bg-white text-[#2C1208] text-sm focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A]"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FAE8E5] rounded-[10px] flex items-center justify-center text-[#C43B2A]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#A07050]">Total Vendido</p>
              <CurrencyDisplay amountUsd={summary.totalUsd} euroRate={euroRate} size="sm" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EDF7EE] rounded-[10px] flex items-center justify-center text-[#2E7D32]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#A07050]">Ganancia Neta</p>
              <p className="text-base font-bold text-[#2E7D32]">
                {formatUSD(summary.totalProfit)}
              </p>
              <p className="text-xs text-[#A07050]">
                {formatBs(convertToBs(summary.totalProfit, euroRate))}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E3F0FF] rounded-[10px] flex items-center justify-center text-[#1565C0]">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#A07050]"># Ventas</p>
              <p className="text-2xl font-bold text-[#2C1208]">{filteredSales.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFF3E0] rounded-[10px] flex items-center justify-center text-[#E65100]">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#A07050]">Margen Promedio</p>
              <p className="text-2xl font-bold text-[#E65100]">
                {summary.avgMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Table */}
      <Card padding="none">
        <div className="p-6 pb-0 flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-[#2C1208]">Historial de Ventas</h3>
            <p className="text-sm text-[#A07050] mt-0.5">
              {filteredSales.length} ventas en el período seleccionado
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-[#A07050]">
            <div className="animate-spin w-8 h-8 border-2 border-[#C43B2A] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm">Cargando ventas...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-[#A07050] opacity-40 mx-auto mb-3" />
            <p className="text-[#6B3A1F] font-semibold">Sin ventas en este período</p>
            <p className="text-[#A07050] text-sm mt-1 mb-4">
              Registra una venta para verla aquí
            </p>
            <Link href="/ventas/nueva">
              <Button variant="primary">Registrar Venta</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8D5BE] bg-[#F5EDE0]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Producto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Cliente</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Cant.</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Total</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Ganancia</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Margen</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">Pago</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => {
                  const margin =
                    (sale.total_price_usd ?? 0) > 0
                      ? ((sale.profit_usd ?? 0) / (sale.total_price_usd ?? 1)) * 100
                      : 0;
                  const payment = PAYMENT_LABELS[sale.payment_method ?? ""] ?? {
                    label: sale.payment_method ?? "—",
                    variant: "default" as const,
                  };

                  return (
                    <tr
                      key={sale.id}
                      className="border-b border-[#E8D5BE] last:border-0 hover:bg-[#FDF3F1] transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="text-[#2C1208] font-medium">
                          {new Date(sale.sold_at).toLocaleDateString("es-VE", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-[#A07050]">
                          {formatRelativeDate(sale.sold_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#2C1208] max-w-[160px] truncate">
                          {sale.product_description || "—"}
                        </div>
                        <div className="text-xs text-[#A07050]">{sale.sale_type}</div>
                      </td>
                      <td className="px-4 py-3 text-[#6B3A1F]">
                        {sale.client_name || <span className="text-[#A07050]">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#2C1208]">
                        {sale.quantity}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-[#2C1208]">
                          {formatUSD(sale.total_price_usd ?? 0)}
                        </div>
                        <div className="text-xs text-[#A07050]">
                          {formatBs(sale.total_price_bs ?? 0)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[#2E7D32] font-medium">
                          {formatUSD(sale.profit_usd ?? 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge
                          variant={margin >= 40 ? "success" : margin >= 20 ? "warning" : "danger"}
                        >
                          {margin.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={payment.variant}>{payment.label}</Badge>
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
