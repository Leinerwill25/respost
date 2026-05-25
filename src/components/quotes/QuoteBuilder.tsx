"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Search,
  PenLine,
  X,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatUSD, convertToBs, formatBs } from "@/lib/currency";
import type { QuoteSection, QuoteSectionItem, IngredientUnit } from "@/types";

// ─── Section templates ────────────────────────────────────────────────────────
const POSTRE_SECTIONS = [
  "Base de postre",
  "Relleno",
  "Segundo relleno",
  "Tercer relleno",
  "Cobertura",
  "Decoración",
  "Complementos",
  "Envases",
  "Extras",
];

const COMBO_SECTIONS = [
  "Componente 1",
  "Componente 2",
  "Componente 3",
  "Componente 4",
  "Componente 5",
  "Componente 6",
  "Componente 7",
  "Relleno",
  "Decoración",
  "Complementos",
  "Envases",
  "Extras",
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Sortable Item (Section) ──────────────────────────────────────────────────
interface SortableSectionProps {
  section: QuoteSection;
  ingredients: any[];
  euroRate: number;
  onUpdate: (updated: QuoteSection) => void;
  onRemove: (id: string) => void;
}

function SortableSection({
  section,
  ingredients,
  euroRate,
  onUpdate,
  onRemove,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const [collapsed, setCollapsed] = useState(false);
  const [showIngSearch, setShowIngSearch] = useState<string | null>(null);
  const [ingQuery, setIngQuery] = useState("");

  const sectionTotal = section.items.reduce((s, i) => s + (i.price_usd || 0), 0);

  const addItem = () => {
    const newItem: QuoteSectionItem = {
      id: generateId(),
      name: "",
      quantity: 1,
      price_usd: 0,
      is_manual: true,
    };
    onUpdate({ ...section, items: [...section.items, newItem] });
  };

  const updateItem = (itemId: string, patch: Partial<QuoteSectionItem>) => {
    onUpdate({
      ...section,
      items: section.items.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item
      ),
    });
  };

  const removeItem = (itemId: string) => {
    onUpdate({ ...section, items: section.items.filter((i) => i.id !== itemId) });
  };

  const selectIngredient = (itemId: string, ing: any) => {
    const unitPrice = ing.price_usd / ing.package_size;
    const item = section.items.find((i) => i.id === itemId);
    const qty = item?.quantity ?? 1;
    updateItem(itemId, {
      name: ing.name,
      ingredient_id: ing.id,
      unit: ing.unit as IngredientUnit,
      price_usd: unitPrice * qty,
      is_manual: false,
    });
    setShowIngSearch(null);
    setIngQuery("");
  };

  const filteredIng = ingredients.filter((i) =>
    i.name.toLowerCase().includes(ingQuery.toLowerCase())
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-[var(--radius-md)] border shadow-sm transition-all ${
        isDragging
          ? "border-[var(--red-600)] shadow-card-hover scale-[1.01]"
          : "border-[var(--border-default)] shadow-card"
      }`}
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 p-3 border-b border-[var(--border-default)] bg-[var(--bg-muted)] rounded-t-[var(--radius-md)]">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[#8A83A3] hover:text-[#56507F] p-1 rounded touch-none"
          title="Arrastrar sección"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex-1 flex items-center gap-2 text-left"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-[#8A83A3]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#8A83A3]" />
          )}
          <span className="font-display font-semibold text-[#0F0926] text-sm">
            {section.name}
          </span>
          <span className="text-xs text-[#8A83A3] ml-1">
            ({section.items.length} item{section.items.length !== 1 ? "s" : ""})
          </span>
        </button>

        {/* Section total */}
        <span className="text-xs font-bold text-[var(--red-600)]">
          {formatUSD(sectionTotal, { showLabel: false })}
        </span>

        {/* Remove section */}
        <button
          onClick={() => onRemove(section.id)}
          className="p-1 text-[#8A83A3] hover:text-red-500 rounded transition-colors"
          title="Eliminar sección"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section Items */}
      {!collapsed && (
        <div className="p-3 space-y-2">
          {section.items.length === 0 && (
            <p className="text-xs text-[#8A83A3] text-center py-3 italic">
              Sin items — agrega ingredientes o entradas manuales
            </p>
          )}

          {section.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2 p-2 bg-[#F6F5FB] rounded-[8px] border border-[#E2E0FF]"
            >
              {/* Item name / ingredient selector */}
              <div className="flex-1 min-w-0 relative">
                {showIngSearch === item.id ? (
                  <div className="relative">
                    <Input
                      placeholder="Buscar insumo..."
                      value={ingQuery}
                      onChange={(e) => setIngQuery(e.target.value)}
                      leftIcon={<Search className="w-3.5 h-3.5" />}
                      className="text-xs"
                      autoFocus
                    />
                    <div className="absolute top-full left-0 right-0 z-20 bg-white border border-[#E2E0FF] rounded-[8px] shadow-card mt-1 max-h-44 overflow-y-auto">
                      {filteredIng.length === 0 ? (
                        <p className="text-xs text-[#8A83A3] p-3 text-center">
                          Sin resultados
                        </p>
                      ) : (
                        filteredIng.slice(0, 20).map((ing) => (
                          <button
                            key={ing.id}
                            onClick={() => selectIngredient(item.id, ing)}
                            className="w-full text-left px-3 py-2 hover:bg-[#EDE9FE] text-xs text-[#0F0926] flex items-center gap-2 border-b border-[#E2E0FF] last:border-0"
                          >
                            <Package className="w-3 h-3 text-[#8A83A3] shrink-0" />
                            <span className="flex-1 truncate">{ing.name}</span>
                            <span className="text-[#8A83A3] shrink-0">
                              {formatUSD(ing.price_usd / ing.package_size)}/{ing.unit}
                            </span>
                          </button>
                        ))
                      )}
                      <button
                        onClick={() => {
                          setShowIngSearch(null);
                          setIngQuery("");
                        }}
                        className="w-full text-center text-xs text-[#8A83A3] py-2 hover:bg-[#EDE9FE]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, { name: e.target.value, is_manual: true })}
                      placeholder="Nombre del item..."
                      className="flex-1 text-xs bg-transparent border-0 outline-none text-[var(--text-heading)] placeholder:text-[var(--text-muted)]/60 min-w-0 font-medium"
                    />
                    <button
                      onClick={() => {
                        setShowIngSearch(item.id);
                        setIngQuery(item.name || "");
                      }}
                      className="shrink-0 p-0.5 text-[var(--text-muted)] hover:text-[var(--red-600)] rounded"
                      title="Buscar insumo"
                    >
                      <Search className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {item.ingredient_id && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-[var(--red-600)] bg-[var(--red-50)] rounded-full px-1.5 py-0.5 font-bold uppercase">
                      Insumo
                    </span>
                    {item.unit && (
                      <span className="text-[10px] text-[#8A83A3]">{item.unit}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] text-[#8A83A3]">Cant.</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.quantity}
                  onChange={(e) => {
                    const qty = parseFloat(e.target.value) || 0;
                    if (item.ingredient_id && !item.is_manual) {
                      const ing = ingredients.find((i) => i.id === item.ingredient_id);
                      if (ing) {
                        const unitPrice = ing.price_usd / ing.package_size;
                        updateItem(item.id, { quantity: qty, price_usd: unitPrice * qty });
                        return;
                      }
                    }
                    updateItem(item.id, { quantity: qty });
                  }}
                  className="w-16 text-xs text-center border border-[var(--border-default)] rounded-[var(--radius-sm)] py-1 px-1 focus:outline-none focus:ring-2 focus:ring-[var(--red-100)] focus:border-[var(--red-600)] bg-white text-[var(--text-heading)] font-semibold"
                />
              </div>

              {/* Price USD */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] text-[#8A83A3]">Precio $</span>
                  <button
                    onClick={() => updateItem(item.id, { is_manual: !item.is_manual })}
                    title={item.is_manual ? "Precio manual" : "Precio automático"}
                    className="text-[var(--text-muted)] hover:text-[var(--red-600)]"
                  >
                    <PenLine className="w-2.5 h-2.5" />
                  </button>
                </div>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.price_usd}
                  onChange={(e) =>
                    updateItem(item.id, {
                      price_usd: parseFloat(e.target.value) || 0,
                      is_manual: true,
                    })
                  }
                  className="w-20 text-xs text-center border border-[var(--border-default)] rounded-[var(--radius-sm)] py-1 px-1 focus:outline-none focus:ring-2 focus:ring-[var(--red-100)] focus:border-[var(--red-600)] bg-white text-[var(--text-heading)] font-semibold"
                />
                {euroRate > 0 && (
                  <span className="text-[10px] text-[#8A83A3]">
                    {formatBs(convertToBs(item.price_usd, euroRate))}
                  </span>
                )}
              </div>

              {/* Remove item */}
              <button
                onClick={() => removeItem(item.id)}
                className="mt-5 p-1 text-[#8A83A3] hover:text-red-500 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Add item button */}
          <button
            onClick={addItem}
            className="w-full py-1.5 text-xs text-[var(--red-600)] hover:text-[var(--red-700)] border border-dashed border-[var(--red-600)]/40 hover:border-[var(--red-600)] rounded-[var(--radius-md)] flex items-center justify-center gap-1 transition-colors font-semibold"
          >
            <Plus className="w-3 h-3" />
            Agregar item
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main QuoteBuilder ────────────────────────────────────────────────────────
interface QuoteBuilderProps {
  value: QuoteSection[];
  onChange: (sections: QuoteSection[]) => void;
  quoteType: "postre" | "combo";
  ingredients: any[];
  euroRate: number;
}

export function QuoteBuilder({
  value,
  onChange,
  quoteType,
  ingredients,
  euroRate,
}: QuoteBuilderProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [customName, setCustomName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );

  const templates = quoteType === "postre" ? POSTRE_SECTIONS : COMBO_SECTIONS;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((s) => s.id === active.id);
      const newIndex = value.findIndex((s) => s.id === over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const addSection = (name: string) => {
    const newSection: QuoteSection = {
      id: generateId(),
      name,
      items: [],
    };
    onChange([...value, newSection]);
    setShowAddMenu(false);
    setCustomName("");
    setShowCustomInput(false);
  };

  const updateSection = useCallback(
    (updated: QuoteSection) => {
      onChange(value.map((s) => (s.id === updated.id ? updated : s)));
    },
    [value, onChange]
  );

  const removeSection = useCallback(
    (id: string) => {
      onChange(value.filter((s) => s.id !== id));
    },
    [value, onChange]
  );

  const totalCostUsd = value
    .flatMap((s) => s.items)
    .reduce((sum, item) => sum + (item.price_usd || 0), 0);

  return (
    <div className="space-y-3">
      {/* Sections list with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={value.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {value.length === 0 && (
              <div className="text-center py-10 bg-[#F6F5FB] rounded-[12px] border border-dashed border-[#E2E0FF]">
                <Package className="w-8 h-8 text-[#E2E0FF] mx-auto mb-2" />
                <p className="text-sm text-[#8A83A3]">Sin secciones</p>
                <p className="text-xs text-[#8A83A3]/70 mt-1">
                  Agrega secciones para construir el presupuesto
                </p>
              </div>
            )}
            {value.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                ingredients={ingredients}
                euroRate={euroRate}
                onUpdate={updateSection}
                onRemove={removeSection}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Section */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setShowAddMenu((v) => !v);
            setShowCustomInput(false);
          }}
          className="w-full"
        >
          Agregar Sección
        </Button>

        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-[#E2E0FF] rounded-[12px] shadow-modal overflow-hidden">
            <div className="p-2 border-b border-[#E2E0FF]">
              <p className="text-xs font-medium text-[#56507F] px-2 py-1">
                Plantillas de sección
              </p>
            </div>
            <div className="max-h-52 overflow-y-auto">
              {templates.map((tpl) => {
                const alreadyAdded = value.some((s) => s.name === tpl);
                return (
                  <button
                    key={tpl}
                    onClick={() => !alreadyAdded && addSection(tpl)}
                    disabled={alreadyAdded}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors border-b border-[#E2E0FF] last:border-0
                      ${
                        alreadyAdded
                          ? "text-[#8A83A3]/50 cursor-default"
                          : "text-[#0F0926] hover:bg-[#EDE9FE]"
                      }`}
                  >
                    {tpl}
                    {alreadyAdded && (
                      <span className="ml-2 text-[10px] text-[#8A83A3]">ya añadida</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="p-2 border-t border-[#E2E0FF]">
              {showCustomInput ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customName.trim()) {
                        addSection(customName.trim());
                      }
                      if (e.key === "Escape") setShowCustomInput(false);
                    }}
                    placeholder="Nombre de la sección..."
                    className="flex-1 text-sm border border-[var(--border-default)] rounded-[var(--radius-md)] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--red-100)] focus:border-[var(--red-600)] bg-white text-[var(--text-heading)]"
                  />
                  <Button
                    size="sm"
                    onClick={() => customName.trim() && addSection(customName.trim())}
                  >
                    Añadir
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full text-sm text-[var(--red-600)] hover:text-[var(--red-700)] py-1.5 flex items-center justify-center gap-1 font-semibold"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Nombre personalizado
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Total cost summary */}
      {value.length > 0 && (
        <div className="bg-[var(--red-50)] border border-[var(--red-100)] rounded-[var(--radius-md)] p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-semibold">Costo total de materiales</p>
            <p className="text-xs text-[var(--text-muted)]">
              Suma de todos los items del presupuesto
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[var(--red-600)] font-display">
              {formatUSD(totalCostUsd)}
            </p>
            {euroRate > 0 && (
              <p className="text-sm text-[var(--text-secondary)] font-semibold">
                {formatBs(convertToBs(totalCostUsd, euroRate))}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
