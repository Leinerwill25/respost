"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Package, Tag, Ruler, DollarSign, Archive, Bell, StickyNote, PlusCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  useCreateIngredient,
  useUpdateIngredient,
  useIngredientCategories,
  useCreateCategory,
} from "@/hooks/useIngredients";
import { formatUSD } from "@/lib/currency";

function getUnitTerminology(unit: string) {
  switch (unit) {
    case "g":
    case "kg":
      return {
        sizeLabel: `Tamaño del empaque/paquete (${unit})`,
        priceLabel: "Precio USD (por empaque/paquete)",
        sizePlaceholder: "Ej: 1000",
        helpText: "Peso total del empaque cerrado en la unidad seleccionada.",
      };
    case "ml":
    case "l":
      return {
        sizeLabel: `Contenido del envase/botella (${unit})`,
        priceLabel: "Precio USD (por envase/botella)",
        sizePlaceholder: "Ej: 1000",
        helpText: "Volumen total del envase en la unidad seleccionada.",
      };
    case "unidades":
      return {
        sizeLabel: "Unidades por empaque/caja",
        priceLabel: "Precio USD (por empaque/caja)",
        sizePlaceholder: "Ej: 12",
        helpText: "Número de unidades individuales que trae el empaque/caja.",
      };
    default:
      return {
        sizeLabel: `Tamaño de la presentación (${unit})`,
        priceLabel: "Precio USD (por presentación)",
        sizePlaceholder: "Ej: 1",
        helpText: "",
      };
  }
}

const UNITS = [
  { value: "g", label: "Gramos (g)" },
  { value: "kg", label: "Kilogramos (kg)" },
  { value: "ml", label: "Mililitros (ml)" },
  { value: "l", label: "Litros (l)" },
  { value: "unidades", label: "Unidades" },
] as const;

const ingredientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  category_id: z.string().optional().nullable(),
  unit: z.enum(["g", "kg", "ml", "l", "unidades"]),
  package_size: z.number().positive("Debe ser mayor a 0"),
  price_usd: z.number().min(0, "Precio no puede ser negativo"),
  stock_quantity: z.number().min(0, "Stock no puede ser negativo"),
  min_stock_alert: z.number().min(0, "Debe ser 0 o mayor"),
  notes: z.string().optional().nullable(),
});

type IngredientFormData = z.infer<typeof ingredientSchema>;

interface IngredientFormProps {
  ingredient?: {
    id: string;
    name: string;
    category_id?: string | null;
    unit: string;
    package_size: number;
    price_usd: number;
    stock_quantity: number;
    min_stock_alert: number;
    notes?: string | null;
  } | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function IngredientForm({
  ingredient,
  onSuccess,
  onCancel,
}: IngredientFormProps) {
  const isEditing = !!ingredient;
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const { data: categories = [], isLoading: loadingCategories } =
    useIngredientCategories();
  const createIngredient = useCreateIngredient();
  const updateIngredient = useUpdateIngredient();
  const createCategory = useCreateCategory();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: ingredient?.name ?? "",
      category_id: ingredient?.category_id ?? null,
      unit: (ingredient?.unit as IngredientFormData["unit"]) ?? "g",
      package_size: ingredient?.package_size ?? 1,
      price_usd: ingredient?.price_usd ?? 0,
      stock_quantity: ingredient?.stock_quantity ?? 0,
      min_stock_alert: ingredient?.min_stock_alert ?? 0,
      notes: ingredient?.notes ?? "",
    },
  });

  useEffect(() => {
    if (ingredient) {
      reset({
        name: ingredient.name,
        category_id: ingredient.category_id,
        unit: ingredient.unit as IngredientFormData["unit"],
        package_size: ingredient.package_size,
        price_usd: ingredient.price_usd,
        stock_quantity: ingredient.stock_quantity,
        min_stock_alert: ingredient.min_stock_alert,
        notes: ingredient.notes ?? "",
      });
    }
  }, [ingredient, reset]);

  const priceUsd = watch("price_usd");
  const packageSize = watch("package_size");
  const unit = watch("unit");
  const terms = getUnitTerminology(unit);

  const unitPrice =
    priceUsd > 0 && packageSize > 0 ? priceUsd / packageSize : null;

  const onSubmit = async (data: IngredientFormData) => {
    const payload = {
      name: data.name.trim(),
      category_id: data.category_id || null,
      unit: data.unit,
      package_size: data.package_size,
      price_usd: data.price_usd,
      stock_quantity: data.stock_quantity,
      min_stock_alert: data.min_stock_alert,
      notes: data.notes?.trim() || null,
    };

    if (isEditing) {
      await updateIngredient.mutateAsync({ id: ingredient.id, updates: payload });
    } else {
      await createIngredient.mutateAsync(payload);
    }
    onSuccess?.();
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    await createCategory.mutateAsync(newCategoryName.trim());
    setNewCategoryName("");
    setShowNewCategory(false);
  };

  const isBusy =
    isSubmitting ||
    createIngredient.isPending ||
    updateIngredient.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />
          Nombre del insumo
        </label>
        <input
          {...register("name")}
          placeholder="Ej: Harina de trigo"
          className={`w-full py-2.5 px-3 border rounded-[var(--radius-md)] text-[var(--text-heading)] bg-white
            placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:ring-3 focus:ring-[var(--red-100)]
            focus:border-[var(--red-600)] transition-all duration-200 text-sm
            ${errors.name ? "border-red-400" : "border-[var(--border-default)]"}`}
        />
        {errors.name && (
          <p className="text-xs text-red-500 font-semibold">{errors.name.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          Categoría
        </label>
        {showNewCategory ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nombre de la nueva categoría"
              className="w-full sm:flex-1 py-2.5 px-3 border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-heading)] bg-white
                placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:ring-3 focus:ring-[var(--red-100)]
                focus:border-[var(--red-600)] transition-all duration-200 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateCategory();
                }
              }}
            />
            <div className="flex gap-2 justify-end sm:justify-start">
              <Button
                type="button"
                size="sm"
                onClick={handleCreateCategory}
                isLoading={createCategory.isPending}
                className="flex-1 sm:flex-initial"
              >
                Crear
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowNewCategory(false);
                  setNewCategoryName("");
                }}
                className="flex-1 sm:flex-initial"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              {...register("category_id")}
              disabled={loadingCategories}
              className="flex-1 py-2.5 px-3 border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-heading)] bg-white
                focus:outline-none focus:ring-3 focus:ring-[var(--red-100)] focus:border-[var(--red-600)]
                transition-all duration-200 text-sm"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              onClick={() => setShowNewCategory(true)}
            >
              Nueva
            </Button>
          </div>
        )}
      </div>

      {/* Unit */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
          <Ruler className="w-3.5 h-3.5" />
          Unidad de medida
        </label>
        <select
          {...register("unit")}
          className="w-full py-2.5 px-3 border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-heading)] bg-white
            focus:outline-none focus:ring-3 focus:ring-[var(--red-100)] focus:border-[var(--red-600)]
            transition-all duration-200 text-sm"
        >
          {UNITS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
        {errors.unit && (
          <p className="text-xs text-red-500 font-semibold">{errors.unit.message}</p>
        )}
      </div>

      {/* Package Size + Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--text-secondary)]">
            {terms.sizeLabel}
          </label>
          <input
            type="number"
            min="0"
            step="any"
            {...register("package_size", { valueAsNumber: true })}
            placeholder={terms.sizePlaceholder}
            className={`w-full py-2.5 px-3 border rounded-[var(--radius-md)] text-[var(--text-heading)] bg-white
              placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:ring-3 focus:ring-[var(--red-100)]
              focus:border-[var(--red-600)] transition-all duration-200 text-sm
              ${errors.package_size ? "border-red-400" : "border-[var(--border-default)]"}`}
          />
          {terms.helpText && (
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{terms.helpText}</p>
          )}
          {errors.package_size && (
            <p className="text-xs text-red-500 font-semibold">{errors.package_size.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            {terms.priceLabel}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            {...register("price_usd", { valueAsNumber: true })}
            placeholder="Ej: 2.50"
            className={`w-full py-2.5 px-3 border rounded-[var(--radius-md)] text-[var(--text-heading)] bg-white
              placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:ring-3 focus:ring-[var(--red-100)]
              focus:border-[var(--red-600)] transition-all duration-200 text-sm
              ${errors.price_usd ? "border-red-400" : "border-[var(--border-default)]"}`}
          />
          {errors.price_usd && (
            <p className="text-xs text-red-500 font-semibold">{errors.price_usd.message}</p>
          )}
        </div>
      </div>

      {/* Warnings for Unit/Weight Confusions */}
      {unit === "kg" && (packageSize >= 10 || watch("stock_quantity") >= 50) && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-[10px] text-xs text-amber-850 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-900">⚠️ ¿Tus cantidades están realmente en Kilogramos?</span>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Ingresaste un valor grande ({packageSize >= 10 ? `${packageSize} kg en el tamaño` : `${watch("stock_quantity")} kg en stock`}). Si este insumo viene en gramos (ej: un empaque de 500 gramos), debes seleccionar la unidad <strong>Gramos (g)</strong> e ingresar 500.
            </p>
          </div>
        </div>
      )}

      {unit === "l" && (packageSize >= 10 || watch("stock_quantity") >= 50) && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-[10px] text-xs text-amber-850 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-900">⚠️ ¿Tus cantidades están realmente en Litros?</span>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Ingresaste un valor grande ({packageSize >= 10 ? `${packageSize} litros en el tamaño` : `${watch("stock_quantity")} litros en stock`}). Si querías indicar mililitros (ej: una esencia de 250 mililitros), debes seleccionar la unidad <strong>Mililitros (ml)</strong> e ingresar 250.
            </p>
          </div>
        </div>
      )}

      {((unit === "g" || unit === "ml") && packageSize > 0 && packageSize < 1) && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-[10px] text-xs text-amber-850 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-900">⚠️ ¿Ingresaste decimales en gramos/mililitros?</span>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Ingresaste un valor menor a 1 ({packageSize} {unit}). Si querías indicar medio kilogramo (0.5 kg) o medio litro (0.5 l), es mejor cambiar la unidad a <strong>Kilogramos (kg)</strong> o <strong>Litros (l)</strong>, o escribirlo en gramos enteros (ej: <strong>500 g</strong>).
            </p>
          </div>
        </div>
      )}

      {/* Calculated Unit Price */}
      {unitPrice !== null && (
        <div className="flex items-center gap-3 p-3 bg-[var(--red-50)] border border-[var(--red-100)] rounded-[var(--radius-md)]">
          <div className="w-8 h-8 bg-[var(--red-100)] rounded-full flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-[var(--red-600)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] font-medium">Precio unitario calculado</p>
            <p className="text-sm font-bold text-[var(--red-600)]">
              {formatUSD(unitPrice)}/{unit}
            </p>
          </div>
          <div className="ml-auto text-xs text-[var(--text-muted)] text-right">
            <span className="text-[var(--text-secondary)] font-semibold">${priceUsd.toFixed(2)}</span>
            {" ÷ "}
            <span className="text-[var(--text-secondary)] font-semibold">
              {packageSize} {unit}
            </span>
          </div>
        </div>
      )}

      {/* Stock + Min Stock Alert */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
            <Archive className="w-3.5 h-3.5" />
            Stock inicial ({unit})
          </label>
          <input
            type="number"
            min="0"
            step="any"
            {...register("stock_quantity", { valueAsNumber: true })}
            placeholder="0"
            className={`w-full py-2.5 px-3 border rounded-[var(--radius-md)] text-[var(--text-heading)] bg-white
              placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:ring-3 focus:ring-[var(--red-100)]
              focus:border-[var(--red-600)] transition-all duration-200 text-sm
              ${errors.stock_quantity ? "border-red-400" : "border-[var(--border-default)]"}`}
          />
          {errors.stock_quantity && (
            <p className="text-xs text-red-500 font-semibold">{errors.stock_quantity.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" />
            Alerta mínima ({unit})
          </label>
          <input
            type="number"
            min="0"
            step="any"
            {...register("min_stock_alert", { valueAsNumber: true })}
            placeholder="0"
            className={`w-full py-2.5 px-3 border rounded-[var(--radius-md)] text-[var(--text-heading)] bg-white
              placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:ring-3 focus:ring-[var(--red-100)]
              focus:border-[var(--red-600)] transition-all duration-200 text-sm
              ${errors.min_stock_alert ? "border-red-400" : "border-[var(--border-default)]"}`}
          />
          <p className="text-xs text-[var(--text-muted)] font-medium">
            Recibe alerta cuando el stock baje de este valor
          </p>
          {errors.min_stock_alert && (
            <p className="text-xs text-red-500 font-semibold">{errors.min_stock_alert.message}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5" />
          Notas{" "}
          <span className="text-[var(--text-muted)] font-normal">(opcional)</span>
        </label>
        <textarea
          {...register("notes")}
          placeholder="Proveedor, marca, observaciones..."
          rows={2}
          className="w-full py-2.5 px-3 border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-heading)] bg-white
            placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:ring-3 focus:ring-[var(--red-100)]
            focus:border-[var(--red-600)] transition-all duration-200 resize-none text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          className="w-full sm:w-auto"
          isLoading={isBusy}
        >
          {isEditing ? "Guardar cambios" : "Crear insumo"}
        </Button>
      </div>
    </form>
  );
}
