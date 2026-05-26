"use client";

import { useState, useEffect, useMemo } from "react";
import { Bar, Doughnut, Line as LineChart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Package,
  Layers,
  Percent,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { createBrowserClient } from "@/lib/supabase/client";
import { useEuroRate } from "@/hooks/useRates";
import { formatUSD, formatBs, convertToBs } from "@/lib/currency";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TABS = [
  { id: "sales", label: "Ventas por Período", icon: BarChart3 },
  { id: "products", label: "Productos Más Vendidos", icon: Layers },
  { id: "profitability", label: "Rentabilidad por Receta", icon: Percent },
  { id: "rates", label: "Historial de Tasas", icon: TrendingUp },
  { id: "ingredients", label: "Insumos Más Usados", icon: Package },
];

export default function ReportesPage() {
  const supabase = createBrowserClient();
  const { data: rateData } = useEuroRate();
  const euroRate = rateData?.rate ?? 1;

  const [activeTab, setActiveTab] = useState("sales");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "last_month" | "custom">("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [sales, setSales] = useState<any[]>([]);
  const [ratesHistory, setRatesHistory] = useState<any[]>([]);
  const [ingredientMovements, setIngredientMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let startStr = "";
        let endStr = "";

        const now = new Date();
        if (dateFilter === "today") {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          startStr = d.toISOString();
        } else if (dateFilter === "week") {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          startStr = d.toISOString();
        } else if (dateFilter === "month") {
          const d = new Date();
          d.setDate(1);
          d.setHours(0, 0, 0, 0);
          startStr = d.toISOString();
        } else if (dateFilter === "last_month") {
          const d = new Date();
          d.setMonth(d.getMonth() - 1);
          d.setDate(1);
          d.setHours(0, 0, 0, 0);
          startStr = d.toISOString();

          const end = new Date();
          end.setDate(0);
          end.setHours(23, 59, 59, 999);
          endStr = end.toISOString();
        } else if (dateFilter === "custom" && startDate) {
          startStr = new Date(startDate).toISOString();
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            endStr = end.toISOString();
          }
        }

        let salesQuery = (supabase as any)
          .from("sales")
          .select("*")
          .eq("user_id", user.id);

        if (startStr) salesQuery = salesQuery.gte("sold_at", startStr);
        if (endStr) salesQuery = salesQuery.lte("sold_at", endStr);

        const { data: salesData } = await salesQuery.order("sold_at", { ascending: true });
        setSales(salesData ?? []);

        const { data: ratesData } = await (supabase as any)
          .from("rates")
          .select("rate, rate_datetime")
          .eq("code", "EUR")
          .order("rate_datetime", { ascending: true })
          .limit(100);
        setRatesHistory(ratesData ?? []);

        let movementsQuery = (supabase as any)
          .from("ingredient_movements")
          .select("*, ingredients(name, unit, price_usd, package_size)")
          .eq("user_id", user.id)
          .eq("reason", "produccion")
          .eq("movement_type", "OUT");

        if (startStr) movementsQuery = movementsQuery.gte("created_at", startStr);
        if (endStr) movementsQuery = movementsQuery.lte("created_at", endStr);

        const { data: movementsData } = await movementsQuery.order("created_at", { ascending: true });
        setIngredientMovements(movementsData ?? []);

      } catch (err) {
        console.error("Error loading reports", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateFilter, startDate, endDate]);

  const salesKPIs = useMemo(() => {
    if (sales.length === 0) return { totalUsd: 0, profitUsd: 0, count: 0, averageUsd: 0 };
    const totalUsd = sales.reduce((sum, s) => sum + (s.total_price_usd ?? 0), 0);
    const profitUsd = sales.reduce((sum, s) => sum + (s.profit_usd ?? 0), 0);
    const count = sales.length;
    const averageUsd = totalUsd / count;
    return { totalUsd, profitUsd, count, averageUsd };
  }, [sales]);

  const salesChartData = useMemo(() => {
    const dailyMap: Record<string, { revenue: number; profit: number }> = {};
    sales.forEach((s) => {
      const dateStr = new Date(s.sold_at).toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "short",
      });
      if (!dailyMap[dateStr]) dailyMap[dateStr] = { revenue: 0, profit: 0 };
      dailyMap[dateStr].revenue += s.total_price_usd ?? 0;
      dailyMap[dateStr].profit += s.profit_usd ?? 0;
    });

    return {
      labels: Object.keys(dailyMap),
      datasets: [
        {
          label: "Vendido (USD)",
          data: Object.values(dailyMap).map((d) => d.revenue),
          backgroundColor: "#C43B2A",
          borderRadius: 4,
        },
        {
          label: "Ganancia Neta (USD)",
          data: Object.values(dailyMap).map((d) => d.profit),
          backgroundColor: "#2E7D32",
          borderRadius: 4,
        },
      ],
    };
  }, [sales]);

  const productRanking = useMemo(() => {
    const productMap: Record<string, { name: string; quantity: number; revenue: number; cost: number }> = {};

    sales.forEach((s) => {
      const name = s.product_description ?? "Producto Manual";
      if (!productMap[name]) {
        productMap[name] = { name, quantity: 0, revenue: 0, cost: 0 };
      }
      productMap[name].quantity += s.quantity;
      productMap[name].revenue += s.total_price_usd ?? 0;
      productMap[name].cost += s.total_cost_usd ?? 0;
    });

    return Object.values(productMap).sort((a, b) => b.quantity - a.quantity);
  }, [sales]);

  const productsChartData = useMemo(() => {
    const top5 = productRanking.slice(0, 5);
    return {
      labels: top5.map((p) => p.name),
      datasets: [
        {
          label: "Unidades vendidas",
          data: top5.map((p) => p.quantity),
          backgroundColor: ["#C43B2A", "#2E7D32", "#1565C0", "#E65100", "#D4920A"],
        },
      ],
    };
  }, [productRanking]);

  const recipeProfitability = useMemo(() => {
    return productRanking.map((p) => {
      const profit = p.revenue - p.cost;
      const margin = p.revenue > 0 ? (profit / p.revenue) * 100 : 0;
      return { ...p, profit, margin };
    }).sort((a, b) => b.profit - a.profit);
  }, [productRanking]);

  const ratesStats = useMemo(() => {
    if (ratesHistory.length === 0) return { min: 0, max: 0, avg: 0 };
    const rates = ratesHistory.map((r) => r.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const avg = rates.reduce((s, r) => s + r, 0) / rates.length;
    return { min, max, avg };
  }, [ratesHistory]);

  const ratesChartData = useMemo(() => {
    return {
      labels: ratesHistory.map((r) =>
        new Date(r.rate_datetime).toLocaleDateString("es-VE", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      ),
      datasets: [
        {
          label: "Tasa EUR/Bs",
          data: ratesHistory.map((r) => r.rate),
          borderColor: "#C43B2A",
          backgroundColor: "rgba(196, 59, 42, 0.06)",
          borderWidth: 2,
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [ratesHistory]);

  const ingredientRanking = useMemo(() => {
    const map: Record<string, { name: string; unit: string; quantity: number; cost: number }> = {};

    ingredientMovements.forEach((m) => {
      const ing = m.ingredients;
      if (!ing) return;
      if (!map[ing.name]) {
        map[ing.name] = { name: ing.name, unit: ing.unit, quantity: 0, cost: 0 };
      }
      map[ing.name].quantity += m.quantity;
      const unitPrice = ing.price_usd / ing.package_size;
      map[ing.name].cost += unitPrice * m.quantity;
    });

    return Object.values(map).sort((a, b) => b.quantity - a.quantity);
  }, [ingredientMovements]);

  const ingredientsChartData = useMemo(() => {
    const top5 = ingredientRanking.slice(0, 5);
    return {
      labels: top5.map((i) => i.name),
      datasets: [
        {
          label: "Costo Estimado Utilizado (USD)",
          data: top5.map((i) => i.cost),
          backgroundColor: "#C43B2A",
          borderRadius: 4,
        },
      ],
    };
  }, [ingredientRanking]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Reportes Financieros"
        subtitle="Analiza la rentabilidad, ventas, tasas e insumos del negocio"
      />

      {/* Date Filters Control */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "today", label: "Hoy" },
              { id: "week", label: "Últimos 7 días" },
              { id: "month", label: "Este mes" },
              { id: "last_month", label: "Mes anterior" },
              { id: "custom", label: "Rango personalizado" },
            ].map((btn) => (
              <Button
                key={btn.id}
                variant={dateFilter === btn.id ? "primary" : "secondary"}
                size="sm"
                onClick={() => setDateFilter(btn.id as any)}
              >
                {btn.label}
              </Button>
            ))}
          </div>

          {dateFilter === "custom" && (
            <div className="grid grid-cols-2 md:flex md:items-center gap-3 w-full md:w-auto animate-fade-in">
              <Input
                type="date"
                label="Desde"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full md:w-[160px]"
              />
              <Input
                type="date"
                label="Hasta"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full md:w-[160px]"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-[#E8D5BE] overflow-x-auto pb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? "border-[#C43B2A] text-[#C43B2A] bg-[#FAE8E5]/40"
                    : "border-transparent text-[#A07050] hover:text-[#6B3A1F] hover:bg-[#FFF8F3]"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#A07050]">Cargando reporte...</div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: SALES */}
          {activeTab === "sales" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <p className="text-xs font-semibold text-[#A07050] uppercase">Total Vendido</p>
                  <CurrencyDisplay amountUsd={salesKPIs.totalUsd} euroRate={euroRate} size="lg" className="mt-1" />
                </Card>
                <Card>
                  <p className="text-xs font-semibold text-[#A07050] uppercase">Ganancia Neta</p>
                  <CurrencyDisplay amountUsd={salesKPIs.profitUsd} euroRate={euroRate} size="lg" className="mt-1" />
                </Card>
                <Card>
                  <p className="text-xs font-semibold text-[#A07050] uppercase">Ventas totales</p>
                  <p className="text-2xl font-bold text-[#2C1208] mt-1">{salesKPIs.count} ventas</p>
                  <p className="text-xs text-[#A07050] mt-0.5">en el período</p>
                </Card>
                <Card>
                  <p className="text-xs font-semibold text-[#A07050] uppercase">Ticket promedio</p>
                  <CurrencyDisplay amountUsd={salesKPIs.averageUsd} euroRate={euroRate} size="lg" className="mt-1" />
                </Card>
              </div>

              <Card>
                <h3 className="font-display font-semibold text-lg text-[#2C1208] mb-4">
                  Desglose diario de ingresos y ganancias
                </h3>
                <div className="h-96">
                  {sales.length === 0 ? (
                    <p className="text-center py-20 text-[#A07050] italic">Sin ventas registradas en el rango</p>
                  ) : (
                    <Bar
                      data={salesChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "top" } },
                        scales: { y: { ticks: { callback: (val) => `$${val}` } } },
                      }}
                    />
                  )}
                </div>
              </Card>
            </>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === "products" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <h3 className="font-display font-semibold text-lg text-[#2C1208] mb-4">
                  Top 5 Productos (Unidades)
                </h3>
                <div className="h-64 flex items-center justify-center">
                  {productRanking.length === 0 ? (
                    <p className="text-sm text-[#A07050] italic">Sin datos</p>
                  ) : (
                    <Doughnut data={productsChartData} />
                  )}
                </div>
              </Card>

              <Card className="lg:col-span-2">
                <h3 className="font-display font-semibold text-lg text-[#2C1208] mb-4">
                  Ranking de ventas por producto
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-[#F5EDE0] text-[#6B3A1F]">
                        <th className="py-2.5 px-4 font-semibold rounded-l-[6px]">Producto</th>
                        <th className="py-2.5 px-4 font-semibold text-center">Uds. vendidas</th>
                        <th className="py-2.5 px-4 font-semibold text-right rounded-r-[6px] sm:rounded-r-none">Facturación USD</th>
                        <th className="py-2.5 px-4 font-semibold text-right rounded-r-[6px] hidden sm:table-cell">Facturación Bs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8D5BE]">
                      {productRanking.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-[#A07050] italic">
                            Sin productos vendidos en este rango
                          </td>
                        </tr>
                      ) : (
                        productRanking.map((prod, idx) => (
                          <tr key={idx} className="hover:bg-[#FDF3F1]">
                            <td className="py-3 px-4 text-[#2C1208] font-medium">{prod.name}</td>
                            <td className="py-3 px-4 text-center font-bold text-[#6B3A1F]">
                              {prod.quantity}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-[#2C1208]">
                              {formatUSD(prod.revenue)}
                            </td>
                            <td className="py-3 px-4 text-right text-[#A07050] hidden sm:table-cell">
                              {formatBs(convertToBs(prod.revenue, euroRate))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: PROFITABILITY */}
          {activeTab === "profitability" && (
            <Card>
              <h3 className="font-display font-semibold text-lg text-[#2C1208] mb-4">
                Rentabilidad detallada por postre / receta
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-[#F5EDE0] text-[#6B3A1F]">
                      <th className="py-3 px-4 font-semibold rounded-l-[6px]">Receta / Producto</th>
                      <th className="py-3 px-4 font-semibold text-right">Vendido (USD)</th>
                      <th className="py-3 px-4 font-semibold text-right hidden sm:table-cell">Costo Materiales (USD)</th>
                      <th className="py-3 px-4 font-semibold text-right rounded-r-[6px] sm:rounded-r-none">Ganancia (USD)</th>
                      <th className="py-3 px-4 font-semibold text-center rounded-r-[6px] hidden sm:table-cell">Margen Promedio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8D5BE]">
                    {recipeProfitability.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#A07050] italic">
                          Sin datos de rentabilidad para este rango
                        </td>
                      </tr>
                    ) : (
                      recipeProfitability.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#FDF3F1]">
                          <td className="py-3 px-4 font-medium text-[#2C1208]">{item.name}</td>
                          <td className="py-3 px-4 text-right font-semibold text-[#2C1208]">
                            {formatUSD(item.revenue)}
                          </td>
                          <td className="py-3 px-4 text-right text-[#C43B2A] font-medium hidden sm:table-cell">
                            {formatUSD(item.cost)}
                          </td>
                          <td className="py-3 px-4 text-right text-[#2E7D32] font-bold">
                            {formatUSD(item.profit)}
                          </td>
                          <td className="py-3 px-4 text-center hidden sm:table-cell">
                            <Badge variant={item.margin > 50 ? "success" : item.margin > 30 ? "info" : "warning"}>
                              {item.margin.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 4: EUR RATES */}
          {activeTab === "rates" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <p className="text-xs font-semibold text-[#A07050] uppercase">Mínima Tasa</p>
                  <p className="text-2xl font-bold text-[#6B3A1F] mt-1">{ratesStats.min.toFixed(2)} Bs</p>
                </Card>
                <Card>
                  <p className="text-xs font-semibold text-[#A07050] uppercase">Promedio Tasa</p>
                  <p className="text-2xl font-bold text-[#C43B2A] mt-1">{ratesStats.avg.toFixed(2)} Bs</p>
                </Card>
                <Card>
                  <p className="text-xs font-semibold text-[#A07050] uppercase">Máxima Tasa</p>
                  <p className="text-2xl font-bold text-[#2E7D32] mt-1">{ratesStats.max.toFixed(2)} Bs</p>
                </Card>
              </div>

              <Card>
                <h3 className="font-display font-semibold text-lg text-[#2C1208] mb-4">
                  Historial del precio del Euro (EUR BCV) en Bolívares
                </h3>
                <div className="h-96">
                  {ratesHistory.length === 0 ? (
                    <p className="text-center py-20 text-[#A07050] italic">Sin tasas cargadas en la tabla rates</p>
                  ) : (
                    <LineChart
                      data={ratesChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: { y: { ticks: { callback: (val) => `${val} Bs` } } },
                      }}
                    />
                  )}
                </div>
              </Card>
            </>
          )}

          {/* TAB 5: INGREDIENTS */}
          {activeTab === "ingredients" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <h3 className="font-display font-semibold text-lg text-[#2C1208] mb-4">
                  Insumos de Mayor Costo de Producción
                </h3>
                <div className="h-64 flex items-center justify-center">
                  {ingredientRanking.length === 0 ? (
                    <p className="text-sm text-[#A07050] italic">Sin datos</p>
                  ) : (
                    <Bar
                      data={ingredientsChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  )}
                </div>
              </Card>

              <Card className="lg:col-span-2">
                <h3 className="font-display font-semibold text-lg text-[#2C1208] mb-4">
                  Ranking de Insumos Usados en Producción
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-[#F5EDE0] text-[#6B3A1F]">
                        <th className="py-2.5 px-4 font-semibold rounded-l-[6px]">Insumo</th>
                        <th className="py-2.5 px-4 font-semibold text-center">Cantidad Consumida</th>
                        <th className="py-2.5 px-4 font-semibold text-right rounded-r-[6px]">Costo Estimado Usado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8D5BE]">
                      {ingredientRanking.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-[#A07050] italic">
                            Sin insumos consumidos en este rango
                          </td>
                        </tr>
                      ) : (
                        ingredientRanking.map((ing, idx) => (
                          <tr key={idx} className="hover:bg-[#FDF3F1]">
                            <td className="py-3 px-4 font-medium text-[#2C1208]">{ing.name}</td>
                            <td className="py-3 px-4 text-center font-semibold text-[#6B3A1F]">
                              {ing.quantity.toLocaleString("es-VE")} {ing.unit}
                            </td>
                            <td className="py-3 px-4 text-right text-[#2C1208] font-bold">
                              {formatUSD(ing.cost)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
