"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Trash2, CheckCircle2, XCircle, Send, ShoppingCart, Eye, EyeOff, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QuotePreview } from "@/components/quotes/QuotePreview";
import { useQuote, useUpdateQuoteStatus, useDeleteQuote } from "@/hooks/useQuotes";
import { useEuroRate } from "@/hooks/useRates";
import { formatUSD } from "@/lib/currency";
import type { QuoteSection } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviado",
  approved: "Aprobado",
  rejected: "Rechazado",
};

const STATUS_BADGES: Record<string, "default" | "success" | "warning" | "danger" | "info" | "primary"> = {
  draft: "default",
  sent: "info",
  approved: "success",
  rejected: "danger",
};

export default function PresupuestoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: quote, isLoading } = useQuote(id);
  const { data: rateData } = useEuroRate();
  const updateStatusMutation = useUpdateQuoteStatus();
  const deleteQuoteMutation = useDeleteQuote();

  const [previewOpen, setPreviewOpen] = useState(true);

  const euroRate = rateData?.rate ?? 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-[#A07050]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C43B2A] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Cargando presupuesto...</span>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-[#FAE8E5] rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-[#C43B2A]" />
        </div>
        <h3 className="font-display text-xl font-bold text-[#2C1208] mb-2">Presupuesto no encontrado</h3>
        <p className="text-sm text-[#A07050] mb-6">El presupuesto solicitado no existe o fue eliminado.</p>
        <Link href="/presupuestos">
          <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Volver a Presupuestos
          </Button>
        </Link>
      </div>
    );
  }

  const sections = (typeof quote.sections === "string"
    ? JSON.parse(quote.sections)
    : quote.sections) as QuoteSection[] ?? [];

  const handleStatusChange = async (status: "draft" | "sent" | "approved" | "rejected") => {
    await updateStatusMutation.mutateAsync({ id, status });
  };

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar este presupuesto?")) {
      await deleteQuoteMutation.mutateAsync(id);
      router.push("/presupuestos");
    }
  };

  const previewQuote = {
    id: quote.id,
    title: quote.title,
    client_name: quote.client_name ?? "Cliente S/N",
    client_contact: quote.client_contact,
    status: quote.status,
    quote_type: quote.quote_type,
    portions: quote.portions,
    valid_until: quote.valid_until,
    notes: quote.notes,
    sections,
    pricing_method: quote.pricing_method,
    subtotal_materials_usd: quote.subtotal_materials_usd,
    final_price_usd: quote.total_price_usd,
    price_per_portion_usd: quote.price_per_portion_usd,
    cost_production_pct: quote.cost_production_pct,
    profit_pct: quote.profit_pct,
    tax_pct: quote.tax_pct,
    fixed_cost_usd: quote.fixed_cost_usd,
    fixed_profit_usd: quote.fixed_profit_usd,
    cost_multiplier: quote.cost_multiplier,
    created_at: quote.created_at,
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/presupuestos">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <PageHeader
          title={quote.title || "Detalle del Presupuesto"}
          subtitle={`Cliente: ${quote.client_name || "S/N"}`}
          actions={
            <div className="flex items-center gap-2 print:hidden">
              {quote.status !== "approved" && (
                <Link href={`/presupuestos/${quote.id}/editar`}>
                  <Button variant="secondary" leftIcon={<Edit2 className="w-4 h-4" />}>
                    Editar
                  </Button>
                </Link>
              )}
              <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>
                Eliminar
              </Button>
            </div>
          }
        />
      </div>

      {/* Control Panel */}
      <Card className="print:hidden">
        <div className="p-4 border-b border-[#E8D5BE] bg-[#F5EDE0] rounded-t-[12px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#A07050] uppercase tracking-wide">Estado Actual:</span>
            <Badge variant={STATUS_BADGES[quote.status]}>
              {STATUS_LABELS[quote.status]}
            </Badge>
          </div>
          {quote.status === "approved" && (
            <Link href={`/ventas/nueva?quoteId=${quote.id}`}>
              <Button size="sm" leftIcon={<ShoppingCart className="w-4 h-4" />} className="bg-green-600 hover:bg-green-700">
                Convertir en Venta
              </Button>
            </Link>
          )}
        </div>
        <div className="p-4 flex flex-wrap gap-3 items-center">
          <span className="text-xs text-[#A07050] font-medium">Cambiar estado del presupuesto:</span>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Send className="w-4 h-4" />}
            onClick={() => handleStatusChange("sent")}
            disabled={quote.status === "sent" || quote.status === "approved"}
          >
            Marcar como Enviado
          </Button>

          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => handleStatusChange("approved")}
            disabled={quote.status === "approved"}
          >
            Aprobar Presupuesto
          </Button>

          <Button
            size="sm"
            variant="danger"
            leftIcon={<XCircle className="w-4 h-4" />}
            onClick={() => handleStatusChange("rejected")}
            disabled={quote.status === "rejected"}
          >
            Rechazar Presupuesto
          </Button>

          {quote.status !== "draft" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleStatusChange("draft")}
            >
              Volver a Borrador
            </Button>
          )}
        </div>
      </Card>

      {/* Printable quote container */}
      <Card padding="none">
        <button
          onClick={() => setPreviewOpen(!previewOpen)}
          className="w-full flex items-center justify-between p-4 border-b border-[#E8D5BE] bg-[#F5EDE0] hover:bg-[#FAE8E5]/50 transition-colors text-left rounded-t-[12px] print:hidden"
        >
          <span className="font-display font-semibold text-[#2C1208] flex items-center gap-2">
            {previewOpen ? <EyeOff className="w-4 h-4 text-[#C43B2A]" /> : <Eye className="w-4 h-4 text-[#C43B2A]" />}
            Vista Previa de Cotización {previewOpen ? "(Ocultar)" : "(Mostrar)"}
          </span>
          {previewOpen ? <ChevronUp className="w-4 h-4 text-[#A07050]" /> : <ChevronDown className="w-4 h-4 text-[#A07050]" />}
        </button>
        {previewOpen && (
          <div className="p-6">
            <QuotePreview quote={previewQuote} euroRate={euroRate} />
          </div>
        )}
      </Card>
    </div>
  );
}
