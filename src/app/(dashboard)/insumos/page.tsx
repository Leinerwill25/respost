"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  SlidersHorizontal,
  AlertTriangle,
  Package,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { IngredientForm } from "@/components/ingredients/IngredientForm";
import { StockAdjustModal } from "@/components/ingredients/StockAdjustModal";
import {
  useIngredients,
  useIngredientCategories,
  useDeleteIngredient,
  useStockAlerts,
} from "@/hooks/useIngredients";
import { useEuroRate } from "@/hooks/useRates";
import { formatIngredientQuantity } from "@/lib/currency";

type IngredientRow = {
  id: string;
  name: string;
  unit: string;
  package_size: number;
  price_usd: number;
  stock_quantity: number;
  min_stock_alert: number;
  notes?: string | null;
  category_id?: string | null;
  ingredient_categories?: { id: string; name: string } | null;
};

export function getPresentationLabel(unit: string, size: number) {
  switch (unit) {
    case "g":
    case "kg":
      return `Empaque: ${size} ${unit}`;
    case "ml":
    case "l":
      return `Envase: ${size} ${unit}`;
    case "unidades":
      return size === 1 ? "Unidad individual" : `Empaque: ${size} unidades`;
    default:
      return `Presentación: ${size} ${unit}`;
  }
}

export default function InsumosPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editIngredient, setEditIngredient] = useState<IngredientRow | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<IngredientRow | null>(null);
  const [stockModal, setStockModal] = useState<IngredientRow | null>(null);

  const { data: ingredients = [], isLoading } = useIngredients();
  const { data: categories = [] } = useIngredientCategories();
  const { data: stockAlerts = [] } = useStockAlerts();
  const { data: rateData } = useEuroRate();
  const deleteIngredient = useDeleteIngredient();

  const euroRate = rateData?.rate ?? 0;

  const filtered = useMemo(() => {
    let result = ingredients as IngredientRow[];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (activeCategory !== "all") {
      result = result.filter((i) => i.category_id === activeCategory);
    }
    return result;
  }, [ingredients, search, activeCategory]);

  const handleOpenCreate = () => {
    setEditIngredient(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (ingredient: IngredientRow) => {
    setEditIngredient(ingredient);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteIngredient.mutateAsync(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const isLowStock = (ing: IngredientRow) =>
    ing.min_stock_alert > 0 && ing.stock_quantity <= ing.min_stock_alert;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Insumos"
        subtitle={`${(ingredients as IngredientRow[]).length} ingredientes registrados`}
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            Nuevo Insumo
          </Button>
        }
      />

      {/* Stock Alert Banner */}
      {stockAlerts.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-[#FFF3E0] border border-[#FFCC80] border-l-4 border-l-[#E65100] rounded-[12px]">
          <div className="w-9 h-9 bg-[#FFE0B2] rounded-[8px] flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-[#E65100]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#E65100]">
              {stockAlerts.length} insumo{stockAlerts.length > 1 ? "s" : ""} con stock bajo
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {stockAlerts.slice(0, 5).map((alert) => (
                <span
                  key={alert.id}
                  className="text-xs bg-white text-[#E65100] border border-[#FFCC80] px-2.5 py-1 rounded-full font-medium"
                >
                  {alert.name}: {alert.stock_quantity}{" "}
                  {alert.unit}
                </span>
              ))}
              {stockAlerts.length > 5 && (
                <span className="text-xs text-[#E65100] font-medium self-center">
                  +{stockAlerts.length - 5} más
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07050]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar insumo..."
            className="w-full pl-10 pr-4 py-2.5 border border-[#E8D5BE] rounded-[12px] text-[#4A2010]
              bg-white placeholder:text-[#A07050]/60 focus:outline-none focus:ring-2
              focus:ring-[#FAE8E5] focus:border-[#C43B2A] transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-2 rounded-[8px] text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === "all"
                ? "bg-[#C43B2A] text-white"
                : "bg-white border border-[#E8D5BE] text-[#6B3A1F] hover:bg-[#FFF8F3]"
            }`}
          >
            Todos ({(ingredients as IngredientRow[]).length})
          </button>
          {categories.map((cat) => {
            const count = (ingredients as IngredientRow[]).filter(
              (i) => i.category_id === cat.id
            ).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-2 rounded-[8px] text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? "bg-[#C43B2A] text-white"
                    : "bg-white border border-[#E8D5BE] text-[#6B3A1F] hover:bg-[#FFF8F3]"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#A07050]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#C43B2A] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Cargando insumos...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#FAE8E5] rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-[#C43B2A]" />
            </div>
            <p className="font-display text-lg font-semibold text-[#2C1208] mb-1">
              {search || activeCategory !== "all"
                ? "Sin resultados"
                : "Sin insumos aún"}
            </p>
            <p className="text-sm text-[#A07050] mb-4">
              {search || activeCategory !== "all"
                ? "Prueba con otros filtros"
                : "Agrega tu primer insumo para comenzar"}
            </p>
            {!search && activeCategory === "all" && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleOpenCreate}
              >
                Agregar insumo
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8D5BE] bg-[#F5EDE0]">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">
                    Nombre
                  </th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide hidden sm:table-cell">
                    Categoría
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide hidden sm:table-cell">
                    Precio unit.
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide">
                    Stock
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide hidden md:table-cell">
                    Mín. Alerta
                  </th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#6B3A1F] uppercase tracking-wide text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5BE]">
                {filtered.map((ing) => {
                  const unitPrice =
                    ing.price_usd > 0 && ing.package_size > 0
                      ? ing.price_usd / ing.package_size
                      : 0;
                  const lowStock = isLowStock(ing);

                  return (
                    <tr
                      key={ing.id}
                      className="hover:bg-[#FDF3F1] transition-colors group"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0 ${
                              lowStock
                                ? "bg-[#FAE8E5]"
                                : "bg-[#F5EDE0]"
                            }`}
                          >
                            <Package
                              className={`w-4 h-4 ${
                                lowStock ? "text-[#C43B2A]" : "text-[#6B3A1F]"
                              }`}
                            />
                          </div>
                          <div>
                            <button
                              onClick={() => router.push(`/insumos/${ing.id}`)}
                              className="font-semibold text-[#2C1208] hover:text-[#C43B2A] transition-colors text-left"
                            >
                              {ing.name}
                            </button>
                            <p className="text-xs text-[#A07050]">
                              {getPresentationLabel(ing.unit, ing.package_size)} · $
                              {ing.price_usd.toFixed(2)}
                              <span className="sm:hidden block mt-0.5 text-[#C43B2A] font-medium">
                                {unitPrice > 0 ? `Unitario: $${unitPrice.toFixed(2)}/${ing.unit}` : ""}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 hidden sm:table-cell">
                        {ing.ingredient_categories ? (
                          <Badge variant="default" size="sm">
                            {ing.ingredient_categories.name}
                          </Badge>
                        ) : (
                          <span className="text-xs text-[#A07050]">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right hidden sm:table-cell">
                        {unitPrice > 0 ? (
                          <CurrencyDisplay
                            amountUsd={unitPrice}
                            euroRate={euroRate}
                            size="sm"
                            className="items-end"
                          />
                        ) : (
                          <span className="text-xs text-[#A07050]">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-sm font-semibold ${
                              lowStock ? "text-[#C43B2A]" : "text-[#2C1208]"
                            }`}
                          >
                            {formatIngredientQuantity(
                              ing.stock_quantity,
                              ing.unit as "g" | "kg" | "ml" | "l" | "unidades"
                            )}
                          </span>
                          {lowStock && (
                            <Badge variant="danger" size="sm" dot>
                              Stock bajo
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right hidden md:table-cell">
                        <span className="text-sm text-[#A07050]">
                          {ing.min_stock_alert > 0
                            ? `${ing.min_stock_alert} ${ing.unit}`
                            : "—"}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-0.5 lg:gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => router.push(`/insumos/${ing.id}`)}
                            className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[#FAE8E5] text-[#A07050] hover:text-[#C43B2A] transition-colors"
                            title="Ver detalle"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setStockModal(ing)}
                            className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[#FAE8E5] text-[#A07050] hover:text-[#C43B2A] transition-colors"
                            title="Ajustar stock"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(ing)}
                            className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[#FAE8E5] text-[#A07050] hover:text-[#C43B2A] transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(ing)}
                            className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[#FAE8E5] text-[#A07050] hover:text-[#C43B2A] transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="border-t border-[#E8D5BE] px-5 py-3 flex items-center justify-between bg-[#F5EDE0] rounded-b-[12px]">
            <span className="text-xs text-[#A07050]">
              Mostrando {filtered.length} de {(ingredients as IngredientRow[]).length} insumos
            </span>
            {stockAlerts.length > 0 && (
              <span className="text-xs text-[#E65100] font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {stockAlerts.length} con stock bajo
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditIngredient(null);
        }}
        title={editIngredient ? "Editar Insumo" : "Nuevo Insumo"}
        size="lg"
      >
        <IngredientForm
          ingredient={editIngredient}
          onSuccess={() => {
            setFormOpen(false);
            setEditIngredient(null);
          }}
          onCancel={() => {
            setFormOpen(false);
            setEditIngredient(null);
          }}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Eliminar Insumo"
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              isLoading={deleteIngredient.isPending}
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-[#FAE8E5] rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-[#C43B2A]" />
          </div>
          <p className="text-[#2C1208] font-semibold text-lg mb-2">
            ¿Eliminar &quot;{deleteConfirm?.name}&quot;?
          </p>
          <p className="text-sm text-[#A07050]">
            Esta acción no se puede deshacer. Se eliminará el insumo y todos
            sus movimientos de stock.
          </p>
        </div>
      </Modal>

      {/* Stock Adjust Modal */}
      {stockModal && (
        <StockAdjustModal
          ingredientId={stockModal.id}
          ingredientName={stockModal.name}
          currentStock={stockModal.stock_quantity}
          unit={stockModal.unit}
          priceUsd={stockModal.price_usd}
          packageSize={stockModal.package_size}
          euroRate={euroRate}
          isOpen={!!stockModal}
          onClose={() => setStockModal(null)}
        />
      )}
    </div>
  );
}
