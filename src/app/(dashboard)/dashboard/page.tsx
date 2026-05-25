"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Package,
  AlertTriangle,
  DollarSign,
  Archive,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { useEuroRate } from "@/hooks/useRates";
import { useMonthlySales, useSalesLast30Days } from "@/hooks/useSales";
import { useStockAlerts } from "@/hooks/useIngredients";
import { useInventory } from "@/hooks/useInventory";
import { useSales } from "@/hooks/useSales";
import { formatRelativeDate, isRateStale } from "@/lib/currency";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

function KPICard({
  title,
  icon,
  iconBg,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#A07050] font-medium mb-2">{title}</p>
          {children}
        </div>
        <div
          className={`w-10 h-10 ${iconBg} rounded-[10px] flex items-center justify-center flex-shrink-0`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: rate } = useEuroRate();
  const { data: monthlySales } = useMonthlySales();
  const { data: last30Days } = useSalesLast30Days();
  const { data: stockAlerts } = useStockAlerts();
  const { data: inventory } = useInventory();
  const { data: allSales } = useSales();

  const euroRate = rate?.rate ?? 1;

  const kpis = useMemo(() => {
    const salesUsd =
      monthlySales?.reduce((sum, s) => sum + (s.total_price_usd ?? 0), 0) ?? 0;
    const profitUsd =
      monthlySales?.reduce((sum, s) => sum + (s.profit_usd ?? 0), 0) ?? 0;
    const inventoryCount =
      inventory?.reduce((sum, i) => sum + i.quantity_available, 0) ?? 0;
    const alertsCount = stockAlerts?.length ?? 0;

    return { salesUsd, profitUsd, inventoryCount, alertsCount };
  }, [monthlySales, inventory, stockAlerts]);

  const chartData = useMemo(() => {
    if (!last30Days) return { labels: [], datasets: [] };

    const byDay: Record<string, { sales: number; profit: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "short",
      });
      byDay[key] = { sales: 0, profit: 0 };
    }

    last30Days.forEach((sale) => {
      const key = new Date(sale.sold_at).toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "short",
      });
      if (byDay[key]) {
        byDay[key].sales += sale.total_price_usd ?? 0;
        byDay[key].profit += sale.profit_usd ?? 0;
      }
    });

    return {
      labels: Object.keys(byDay),
      datasets: [
        {
          label: "Ventas (USD)",
          data: Object.values(byDay).map((d) => d.sales),
          borderColor: "#C43B2A",
          backgroundColor: "rgba(196, 59, 42, 0.08)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#C43B2A",
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: "Ganancia (USD)",
          data: Object.values(byDay).map((d) => d.profit),
          borderColor: "#2E7D32",
          backgroundColor: "rgba(46, 125, 50, 0.05)",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: "#2E7D32",
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [last30Days]);

  const topProducts = useMemo(() => {
    if (!allSales) return [];
    const counts: Record<string, { name: string; count: number; revenue: number }> = {};
    allSales.forEach((sale) => {
      const key = sale.product_description ?? sale.finished_inventory_id ?? "manual";
      if (!counts[key]) {
        counts[key] = { name: sale.product_description ?? "Producto", count: 0, revenue: 0 };
      }
      counts[key].count += sale.quantity;
      counts[key].revenue += sale.total_price_usd ?? 0;
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [allSales]);

  const rateIsStale = rate ? isRateStale(rate.rate_datetime, 2) : false;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Tasa BCV banner */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-[12px] border text-sm ${
          rateIsStale
            ? "bg-[#FFF3E0] border-[#FFCC80] text-[#E65100]"
            : "bg-[#FDF3F1] border-[#FAE8E5] text-[#C43B2A]"
        }`}
      >
        <TrendingUp className="w-4 h-4 flex-shrink-0" />
        <span>
          <strong>Tasa EUR/Bs BCV:</strong>{" "}
          {rate ? `${rate.rate.toFixed(2)} Bs` : "Cargando..."}{" "}
          {rate && (
            <span className="opacity-70">
              • Actualizada: {formatRelativeDate(rate.rate_datetime)}
            </span>
          )}
        </span>
        {rateIsStale && (
          <span className="ml-auto flex items-center gap-1 text-[#E65100]">
            <AlertTriangle className="w-3.5 h-3.5" />
            Tasa desactualizada
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Ventas del mes"
          iconBg="bg-[#FAE8E5]"
          icon={<DollarSign className="w-5 h-5 text-[#C43B2A]" />}
        >
          <CurrencyDisplay
            amountUsd={kpis.salesUsd}
            euroRate={euroRate}
            size="lg"
          />
        </KPICard>

        <KPICard
          title="Ganancia neta"
          iconBg="bg-[#EDF7EE]"
          icon={<TrendingUp className="w-5 h-5 text-[#2E7D32]" />}
        >
          <CurrencyDisplay
            amountUsd={kpis.profitUsd}
            euroRate={euroRate}
            size="lg"
          />
        </KPICard>

        <KPICard
          title="Productos en inventario"
          iconBg="bg-[#E3F0FF]"
          icon={<Archive className="w-5 h-5 text-[#1565C0]" />}
        >
          <div>
            <p className="text-2xl font-bold text-[#2C1208]">
              {kpis.inventoryCount}
            </p>
            <p className="text-sm text-[#A07050]">unidades disponibles</p>
          </div>
        </KPICard>

        <KPICard
          title="Alertas de stock"
          iconBg={kpis.alertsCount > 0 ? "bg-[#FFF3E0]" : "bg-[#EDF7EE]"}
          icon={
            <AlertTriangle
              className={`w-5 h-5 ${
                kpis.alertsCount > 0 ? "text-[#E65100]" : "text-[#2E7D32]"
              }`}
            />
          }
        >
          <div>
            <p className="text-2xl font-bold text-[#2C1208]">
              {kpis.alertsCount}
            </p>
            <p className="text-sm text-[#A07050]">
              {kpis.alertsCount === 0 ? "Sin alertas" : "insumos críticos"}
            </p>
          </div>
        </KPICard>
      </div>

      {/* Gráfico + Top Productos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Gráfico de ventas */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Ventas últimos 30 días"
            subtitle="Ventas y ganancia diaria en USD"
          />
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      font: { family: "var(--font-body)", size: 12 },
                      color: "#A07050",
                      boxWidth: 12,
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (ctx) =>
                        `${ctx.dataset.label}: $${ctx.parsed?.y != null ? ctx.parsed.y.toFixed(2) : "0.00"}`,
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { color: "#F5EDE0" },
                    ticks: {
                      color: "#A07050",
                      font: { size: 10 },
                      maxTicksLimit: 10,
                    },
                  },
                  y: {
                    grid: { color: "#F5EDE0" },
                    ticks: {
                      color: "#A07050",
                      font: { size: 10 },
                      callback: (v) => `$${v}`,
                    },
                  },
                },
              }}
            />
          </div>
        </Card>

        {/* Top productos */}
        <Card>
          <CardHeader
            title="Top 5 productos"
            subtitle="Más vendidos de todos los tiempos"
          />
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-[#A07050] text-center py-4">
                Aún no hay ventas registradas
              </p>
            ) : (
              topProducts.map((product, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3"
                >
                  <span className="w-6 h-6 bg-[#FAE8E5] text-[#C43B2A] text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2C1208] truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#A07050]">
                      {product.count} vendidos · ${product.revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link href="/ventas" className="block mt-4">
            <Button variant="ghost" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Ver todas las ventas
            </Button>
          </Link>
        </Card>
      </div>

      {/* Alertas de stock bajos */}
      {(stockAlerts?.length ?? 0) > 0 && (
        <Card className="border-[#FFCC80] bg-[#FFF3E0]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#E65100]" />
              <h3 className="font-semibold text-[#E65100]">
                ⚠️ {stockAlerts!.length} insumo
                {stockAlerts!.length > 1 ? "s necesitan" : " necesita"} reposición
              </h3>
            </div>
            <Link href="/insumos">
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Ver insumos
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stockAlerts?.slice(0, 6).map((alert) => (
              <Link
                key={alert.id}
                href={`/insumos/${alert.id}`}
                className="flex items-center gap-3 p-3 bg-white rounded-[8px] border border-[#FFCC80] hover:border-[#E65100] transition-colors"
              >
                <Package className="w-4 h-4 text-[#E65100] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#2C1208] truncate">
                    {alert.name}
                  </p>
                  <p className="text-xs text-[#E65100]">
                    {alert.stock_quantity} / {alert.min_stock_alert} {alert.unit}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Acciones rápidas */}
      <Card>
        <CardHeader title="Acciones rápidas" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/insumos", label: "Nuevo Insumo", icon: Package, color: "text-[#C43B2A]", bg: "bg-[#FAE8E5]" },
            { href: "/recetas/nueva", label: "Nueva Receta", icon: Plus, color: "text-[#1565C0]", bg: "bg-[#E3F0FF]" },
            { href: "/ventas/nueva", label: "Registrar Venta", icon: DollarSign, color: "text-[#2E7D32]", bg: "bg-[#EDF7EE]" },
            { href: "/presupuestos/nuevo", label: "Nuevo Presupuesto", icon: Package, color: "text-[#E65100]", bg: "bg-[#FFF3E0]" },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-[10px] border border-[#E8D5BE] hover:border-[#C43B2A] hover:bg-[#FDF3F1] transition-all duration-200 text-center group"
              >
                <div className={`w-10 h-10 ${action.bg} rounded-[10px] flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="text-xs font-medium text-[#6B3A1F]">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
