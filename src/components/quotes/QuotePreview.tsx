"use client";

import { useRef } from "react";
import { Printer, Croissant } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { formatUSD, formatBs, convertToBs } from "@/lib/currency";
import type { QuoteSection } from "@/types";

interface QuotePreviewProps {
  quote: {
    id: string;
    title: string;
    client_name: string;
    client_contact?: string | null;
    status: string;
    quote_type: string;
    portions: number;
    valid_until?: string | null;
    notes?: string | null;
    sections: QuoteSection[];
    pricing_method: string;
    subtotal_materials_usd: number;
    final_price_usd: number;
    price_per_portion_usd: number;
    cost_production_pct?: number | null;
    profit_pct?: number | null;
    tax_pct?: number | null;
    fixed_cost_usd?: number | null;
    fixed_profit_usd?: number | null;
    cost_multiplier?: number | null;
    created_at: string;
  };
  euroRate: number;
  businessName?: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviado",
  approved: "Aprobado",
  rejected: "Rechazado",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-50 text-blue-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export function QuotePreview({
  quote,
  euroRate,
  businessName = "PastryPro",
}: QuotePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const allItems = quote.sections?.flatMap((s) =>
    s.items.map((item) => ({ ...item, sectionName: s.name }))
  ) ?? [];

  const createdDate = new Date(quote.created_at).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const validUntilDate = quote.valid_until
    ? new Date(quote.valid_until).toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const quoteNumber = `PRES-${quote.id.slice(0, 8).toUpperCase()}`;

  const finalPriceBs = convertToBs(quote.final_price_usd, euroRate);
  const perPortionBs = convertToBs(quote.price_per_portion_usd, euroRate);

  return (
    <div className="space-y-4">
      {/* Print button (hidden in print) */}
      <div className="flex justify-end print:hidden">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Printer className="w-4 h-4" />}
          onClick={handlePrint}
        >
          Imprimir / Guardar PDF
        </Button>
      </div>

      {/* Quote document */}
      <div
        ref={printRef}
        className="bg-white rounded-[12px] border border-[#E2E0FF] shadow-card overflow-hidden print:shadow-none print:border-0 print:rounded-none"
        id="quote-printable"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6C22F5] to-[#4A0ED4] p-8 text-white print:bg-[#6C22F5]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-[12px] flex items-center justify-center">
                <Croissant className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">{businessName}</h1>
                <p className="text-white/80 text-sm">Sistema de Gestión de Repostería</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/70 uppercase tracking-wide mb-1">
                Presupuesto
              </div>
              <div className="font-mono text-lg font-bold">{quoteNumber}</div>
              <div className="text-sm text-white/80 mt-1">{createdDate}</div>
            </div>
          </div>
        </div>

        {/* Client & meta info */}
        <div className="p-6 border-b border-[#E2E0FF] bg-[#F6F5FB]">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-[#8A83A3] uppercase tracking-wide mb-1">Cliente</p>
              <p className="font-semibold text-[#0F0926] text-lg">{quote.client_name}</p>
              {quote.client_contact && (
                <p className="text-sm text-[#56507F] mt-0.5">{quote.client_contact}</p>
              )}
            </div>
            <div className="text-right space-y-1">
              <div className="flex justify-end gap-2 items-center">
                <span className="text-xs text-[#8A83A3]">Estado:</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    STATUS_COLORS[quote.status] || STATUS_COLORS.draft
                  }`}
                >
                  {STATUS_LABELS[quote.status] || quote.status}
                </span>
              </div>
              <div className="flex justify-end gap-2 items-center">
                <span className="text-xs text-[#8A83A3]">Tipo:</span>
                <span className="text-xs font-medium text-[#56507F] capitalize">
                  {quote.quote_type}
                </span>
              </div>
              <div className="flex justify-end gap-2 items-center">
                <span className="text-xs text-[#8A83A3]">Porciones:</span>
                <span className="text-xs font-medium text-[#56507F]">{quote.portions}</span>
              </div>
              {validUntilDate && (
                <div className="flex justify-end gap-2 items-center">
                  <span className="text-xs text-[#8A83A3]">Válido hasta:</span>
                  <span className="text-xs font-medium text-[#56507F]">{validUntilDate}</span>
                </div>
              )}
            </div>
          </div>
          {quote.title && (
            <div className="mt-4 pt-4 border-t border-[#E2E0FF]">
              <p className="font-display text-xl font-bold text-[#0F0926]">{quote.title}</p>
            </div>
          )}
        </div>

        {/* Sections & Items */}
        <div className="p-6">
          <h2 className="font-display font-semibold text-[#0F0926] text-lg mb-4">
            Desglose de Materiales
          </h2>

          {(quote.sections ?? []).length === 0 ? (
            <p className="text-sm text-[#8A83A3] italic">Sin secciones añadidas.</p>
          ) : (
            <div className="space-y-4">
              {(quote.sections ?? []).map((section) => (
                <div key={section.id}>
                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#6C22F5]" />
                    <h3 className="font-semibold text-[#56507F] text-sm">{section.name}</h3>
                    <div className="flex-1 border-b border-[#E2E0FF]" />
                  </div>

                  {/* Items table */}
                  {section.items.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#EDE9FE]">
                          <th className="text-left py-1.5 px-3 text-xs font-medium text-[#56507F] rounded-l-[6px]">
                            Ítem
                          </th>
                          <th className="text-center py-1.5 px-3 text-xs font-medium text-[#56507F]">
                            Cant.
                          </th>
                          <th className="text-center py-1.5 px-3 text-xs font-medium text-[#56507F]">
                            Unidad
                          </th>
                          <th className="text-right py-1.5 px-3 text-xs font-medium text-[#56507F] rounded-r-[6px]">
                            Precio USD
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.items.map((item, idx) => (
                          <tr
                            key={item.id}
                            className={idx % 2 === 0 ? "bg-white" : "bg-[#F6F5FB]"}
                          >
                            <td className="py-1.5 px-3 text-[#0F0926]">
                              {item.name || "(sin nombre)"}
                            </td>
                            <td className="py-1.5 px-3 text-center text-[#56507F]">
                              {item.quantity}
                            </td>
                            <td className="py-1.5 px-3 text-center text-[#8A83A3] text-xs">
                              {item.unit || "—"}
                            </td>
                            <td className="py-1.5 px-3 text-right font-medium text-[#0F0926]">
                              {formatUSD(item.price_usd)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td
                            colSpan={3}
                            className="py-1.5 px-3 text-right text-xs font-semibold text-[#56507F]"
                          >
                            Subtotal {section.name}:
                          </td>
                          <td className="py-1.5 px-3 text-right font-bold text-[#6C22F5]">
                            {formatUSD(
                              section.items.reduce((s, i) => s + i.price_usd, 0)
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  ) : (
                    <p className="text-xs text-[#8A83A3] italic ml-4">
                      Sin ítems en esta sección.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div className="mx-6 mb-6 bg-[#F6F5FB] rounded-[12px] border border-[#E2E0FF] overflow-hidden">
          <div className="p-4 border-b border-[#E2E0FF]">
            <h2 className="font-display font-semibold text-[#0F0926]">
              Resumen de Precios
            </h2>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#56507F]">Costo de materiales:</span>
              <span className="font-medium text-[#0F0926]">
                {formatUSD(quote.subtotal_materials_usd)}
              </span>
            </div>

            {quote.pricing_method === "percentage" && (
              <>
                {quote.cost_production_pct != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8A83A3]">
                      Costo producción ({quote.cost_production_pct}%):
                    </span>
                    <span className="text-[#56507F]">
                      {formatUSD(
                        quote.subtotal_materials_usd * (quote.cost_production_pct / 100)
                      )}
                    </span>
                  </div>
                )}
                {quote.profit_pct != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8A83A3]">Ganancia ({quote.profit_pct}%):</span>
                    <span className="text-[#56507F]">
                      {formatUSD(
                        (quote.subtotal_materials_usd *
                          (1 + (quote.cost_production_pct ?? 50) / 100)) *
                          (quote.profit_pct / 100)
                      )}
                    </span>
                  </div>
                )}
              </>
            )}

            {quote.pricing_method === "fixed" && (
              <>
                {quote.fixed_cost_usd != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8A83A3]">Costo producción fijo:</span>
                    <span className="text-[#56507F]">{formatUSD(quote.fixed_cost_usd)}</span>
                  </div>
                )}
                {quote.fixed_profit_usd != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8A83A3]">Ganancia fija:</span>
                    <span className="text-[#56507F]">{formatUSD(quote.fixed_profit_usd)}</span>
                  </div>
                )}
              </>
            )}

            {quote.pricing_method === "multiplication" && quote.cost_multiplier != null && (
              <div className="flex justify-between text-sm">
                <span className="text-[#8A83A3]">
                  Multiplicador (×{quote.cost_multiplier}):
                </span>
                <span className="text-[#56507F]">
                  {formatUSD(quote.subtotal_materials_usd * quote.cost_multiplier)}
                </span>
              </div>
            )}

            {quote.tax_pct != null && quote.tax_pct > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#8A83A3]">IVA ({quote.tax_pct}%):</span>
                <span className="text-[#56507F]">
                  {formatUSD(quote.final_price_usd - quote.final_price_usd / (1 + quote.tax_pct / 100))}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-[#E2E0FF]">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#0F0926]">PRECIO FINAL</span>
                <div className="text-right">
                  <p className="font-bold text-[#6C22F5] text-lg">
                    {formatUSD(quote.final_price_usd)}
                  </p>
                  <p className="text-sm text-[#56507F]">
                    {formatBs(finalPriceBs)}
                  </p>
                </div>
              </div>
              {quote.portions > 1 && (
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-[#8A83A3]">
                    Precio por porción ({quote.portions} porciones):
                  </span>
                  <div className="text-right">
                    <p className="font-semibold text-[#56507F]">
                      {formatUSD(quote.price_per_portion_usd)}
                    </p>
                    <p className="text-xs text-[#8A83A3]">
                      {formatBs(perPortionBs)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="mx-6 mb-6 p-4 bg-amber-50 rounded-[12px] border border-amber-200">
            <p className="text-xs font-semibold text-amber-800 mb-1 uppercase tracking-wide">
              Notas
            </p>
            <p className="text-sm text-amber-900 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="border-t border-[#E2E0FF] pt-4 flex items-center justify-between text-xs text-[#8A83A3]">
            <p>
              Generado por <span className="font-semibold text-[#6C22F5]">PastryPro</span>
            </p>
            {validUntilDate && (
              <p>
                Cotización válida hasta:{" "}
                <span className="font-medium text-[#56507F]">{validUntilDate}</span>
              </p>
            )}
            <p className="font-mono">{quoteNumber}</p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #quote-printable,
          #quote-printable * {
            visibility: visible;
          }
          #quote-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
