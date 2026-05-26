"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Eye, Edit2, Trash2, FileText, CheckCircle2, XCircle, Send, FileMinus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { useQuotes, useUpdateQuoteStatus, useDeleteQuote } from "@/hooks/useQuotes";
import { useEuroRate } from "@/hooks/useRates";
import { formatUSD, convertToBs, formatBs, formatRelativeDate } from "@/lib/currency";

const STATUS_TABS = [
  { id: "all", label: "Todos", countKey: "all" },
  { id: "draft", label: "Borradores", countKey: "draft" },
  { id: "sent", label: "Enviados", countKey: "sent" },
  { id: "approved", label: "Aprobados", countKey: "approved" },
  { id: "rejected", label: "Rechazados", countKey: "rejected" },
];

const STATUS_BADGES: Record<string, "default" | "success" | "warning" | "danger" | "info" | "primary"> = {
  draft: "default",
  sent: "info",
  approved: "success",
  rejected: "danger",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviado",
  approved: "Aprobado",
  rejected: "Rechazado",
};

export default function PresupuestosPage() {
  const { data: quotes, isLoading } = useQuotes();
  const { data: rate } = useEuroRate();
  const updateStatusMutation = useUpdateQuoteStatus();
  const deleteQuoteMutation = useDeleteQuote();

  const [activeTab, setActiveTab] = useState("all");
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);

  const euroRate = rate?.rate ?? 1;

  const counts = useMemo(() => {
    const defaultCounts = { all: 0, draft: 0, sent: 0, approved: 0, rejected: 0 };
    if (!quotes) return defaultCounts;
    return quotes.reduce((acc, quote) => {
      acc.all++;
      if (quote.status in acc) {
        acc[quote.status as keyof typeof acc]++;
      }
      return acc;
    }, { ...defaultCounts });
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    if (!quotes) return [];
    if (activeTab === "all") return quotes;
    return quotes.filter((q) => q.status === activeTab);
  }, [quotes, activeTab]);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este presupuesto?")) {
      await deleteQuoteMutation.mutateAsync(id);
    }
  };

  const handleStatusChange = async (id: string, status: "draft" | "sent" | "approved" | "rejected") => {
    await updateStatusMutation.mutateAsync({ id, status });
    setStatusMenuId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Presupuestos"
        subtitle="Crea y gestiona cotizaciones para tus clientes"
        actions={
          <Link href="/presupuestos/nuevo">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Nuevo Presupuesto
            </Button>
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-[#E8D5BE] overflow-x-auto pb-px">
        {STATUS_TABS.map((tab) => (
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
            {tab.label}
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-[#C43B2A] text-white" : "bg-[#FAE8E5] text-[#6B3A1F]"}`}>
              {counts[tab.countKey as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-12 text-[#A07050]">Cargando presupuestos...</div>
      ) : filteredQuotes.length === 0 ? (
        <Card className="text-center py-16">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-[#F5EDE0] rounded-[12px] flex items-center justify-center mx-auto text-[#A07050] border border-[#E8D5BE]">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#2C1208]">Sin presupuestos</h3>
            <p className="text-sm text-[#A07050]">
              {activeTab === "all"
                ? "No has creado ningún presupuesto todavía. ¡Comienza creando el primero!"
                : `No hay presupuestos con estado "${STATUS_LABELS[activeTab]}".`}
            </p>
            {activeTab === "all" && (
              <Link href="/presupuestos/nuevo">
                <Button size="sm">Crear Presupuesto</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="bg-white rounded-[12px] border border-[#E8D5BE] overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[#F5EDE0] text-[#6B3A1F] border-b border-[#E8D5BE]">
                  <th className="py-4 px-6 font-semibold">Cliente / Título</th>
                  <th className="py-4 px-4 font-semibold text-center hidden sm:table-cell">Fecha</th>
                  <th className="py-4 px-4 font-semibold text-center hidden md:table-cell">Porciones</th>
                  <th className="py-4 px-6 font-semibold text-right">Precio Final</th>
                  <th className="py-4 px-4 font-semibold text-center">Estado</th>
                  <th className="py-4 px-6 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5BE]">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-[#FFF8F3] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-[#2C1208] text-base">{quote.client_name || "Cliente S/N"}</div>
                      <div className="text-xs text-[#A07050] flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3 text-[#C43B2A]" />
                        <span>{quote.title || "Sin título"}</span>
                        <span className="text-[#E8D5BE]">•</span>
                        <span className="capitalize">{quote.quote_type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-[#6B3A1F] hidden sm:table-cell">
                      <div className="text-sm font-medium">{new Date(quote.created_at).toLocaleDateString("es-VE", { day: "2-digit", month: "short" })}</div>
                      <div className="text-xs text-[#A07050]">{formatRelativeDate(quote.created_at)}</div>
                    </td>
                    <td className="py-4 px-4 text-center text-[#6B3A1F] font-medium hidden md:table-cell">
                      {quote.portions}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <CurrencyDisplay
                        amountUsd={quote.total_price_usd}
                        euroRate={euroRate}
                        size="md"
                        className="items-end"
                      />
                    </td>
                    <td className="py-4 px-4 text-center relative">
                      <Badge variant={STATUS_BADGES[quote.status]}>
                        {STATUS_LABELS[quote.status]}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/presupuestos/${quote.id}`}>
                          <button
                            className="p-2 text-[#A07050] hover:text-[#C43B2A] hover:bg-[#FAE8E5] rounded-[6px] transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>

                        {quote.status !== "approved" ? (
                          <Link href={`/presupuestos/${quote.id}/editar`}>
                            <button
                              className="p-2 text-[#A07050] hover:text-[#C43B2A] hover:bg-[#FAE8E5] rounded-[6px] transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="p-2 text-[#A07050]/40 rounded-[6px] cursor-not-allowed"
                            title="No se puede editar un presupuesto aprobado"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        <div className="relative">
                          <button
                            onClick={() => setStatusMenuId(statusMenuId === quote.id ? null : quote.id)}
                            className="px-2 py-1 text-xs border border-[#E8D5BE] hover:border-[#C43B2A] text-[#6B3A1F] rounded-[6px] hover:bg-[#FAE8E5] transition-colors font-medium"
                          >
                            Estado
                          </button>

                          {statusMenuId === quote.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setStatusMenuId(null)} />
                              <div className="absolute right-0 mt-1 w-36 bg-white border border-[#E8D5BE] rounded-[8px] shadow-modal z-20 overflow-hidden py-1">
                                {(["draft", "sent", "approved", "rejected"] as const).map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusChange(quote.id, status)}
                                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center gap-2 hover:bg-[#FAE8E5]
                                      ${quote.status === status ? "font-bold text-[#C43B2A] bg-[#FAE8E5]/50" : "text-[#2C1208]"}`}
                                  >
                                    {status === "draft" && <FileMinus className="w-3.5 h-3.5" />}
                                    {status === "sent" && <Send className="w-3.5 h-3.5" />}
                                    {status === "approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {status === "rejected" && <XCircle className="w-3.5 h-3.5" />}
                                    {STATUS_LABELS[status]}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => handleDelete(quote.id)}
                          className="p-2 text-[#A07050] hover:text-[#C43B2A] hover:bg-[#FAE8E5] rounded-[6px] transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
