import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type Ingredient = Database["public"]["Tables"]["ingredients"]["Row"] & {
  ingredient_categories: { id: string; name: string } | null;
};
type IngredientInsert = Omit<Database["public"]["Tables"]["ingredients"]["Insert"], "user_id">;
type IngredientUpdate = Database["public"]["Tables"]["ingredients"]["Update"];
type IngredientCategory = Database["public"]["Tables"]["ingredient_categories"]["Row"];
type IngredientMovement = Database["public"]["Tables"]["ingredient_movements"]["Row"];
type StockAlertIngredient = Pick<
  Database["public"]["Tables"]["ingredients"]["Row"],
  "id" | "name" | "unit" | "stock_quantity" | "min_stock_alert" | "price_usd" | "package_size"
>;

export function useIngredients() {
  const supabase = createBrowserClient();

  return useQuery<Ingredient[]>({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("ingredients")
        .select("*, ingredient_categories(id, name)")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw new Error(error.message);
      return (data ?? []) as Ingredient[];
    },
  });
}

export function useIngredient(id: string) {
  const supabase = createBrowserClient();

  return useQuery<Ingredient | null>({
    queryKey: ["ingredient", id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("ingredients")
        .select("*, ingredient_categories(id, name)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) return null;
      return data as Ingredient;
    },
    enabled: !!id,
  });
}

export function useIngredientCategories() {
  const supabase = createBrowserClient();

  return useQuery<IngredientCategory[]>({
    queryKey: ["ingredient-categories"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("ingredient_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw new Error(error.message);
      return (data ?? []) as IngredientCategory[];
    },
  });
}

export function useIngredientMovements(ingredientId: string) {
  const supabase = createBrowserClient();

  return useQuery<IngredientMovement[]>({
    queryKey: ["ingredient-movements", ingredientId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("ingredient_movements")
        .select("*")
        .eq("ingredient_id", ingredientId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw new Error(error.message);
      return (data ?? []) as IngredientMovement[];
    },
    enabled: !!ingredientId,
  });
}

export function useStockAlerts() {
  const supabase = createBrowserClient();

  return useQuery<StockAlertIngredient[]>({
    queryKey: ["stock-alerts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("ingredients")
        .select("id, name, unit, stock_quantity, min_stock_alert, price_usd, package_size")
        .eq("user_id", user.id)
        .gt("min_stock_alert", 0);

      if (error) throw new Error(error.message);

      return ((data ?? []) as StockAlertIngredient[]).filter(
        (ing) => ing.stock_quantity <= ing.min_stock_alert
      );
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateIngredient() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation<Database["public"]["Tables"]["ingredients"]["Row"], Error, IngredientInsert>({
    mutationFn: async (ingredient) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("ingredients")
        .insert({ ...ingredient, user_id: user.id })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["stock-alerts"] });
      toast.success("Insumo creado exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al crear insumo: ${error.message}`);
    },
  });
}

export function useUpdateIngredient() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation<
    Database["public"]["Tables"]["ingredients"]["Row"],
    Error,
    { id: string; updates: IngredientUpdate }
  >({
    mutationFn: async ({ id, updates }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("ingredients")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["ingredient", id] });
      queryClient.invalidateQueries({ queryKey: ["stock-alerts"] });
      toast.success("Insumo actualizado");
    },
    onError: (error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });
}

export function useDeleteIngredient() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("ingredients")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["stock-alerts"] });
      toast.success("Insumo eliminado");
    },
    onError: (error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });
}

export function useAdjustStock() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation<
    number,
    Error,
    {
      ingredientId: string;
      quantity: number;
      movementType: "IN" | "OUT";
      reason: "compra" | "produccion" | "merma" | "ajuste";
      euroRate?: number;
      notes?: string;
    }
  >({
    mutationFn: async ({ ingredientId, quantity, movementType, reason, euroRate, notes }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      // 1. Registrar movimiento
      const { error: movError } = await sb
        .from("ingredient_movements")
        .insert({
          user_id: user.id,
          ingredient_id: ingredientId,
          movement_type: movementType,
          quantity,
          reason,
          euro_rate: euroRate ?? null,
          notes: notes ?? null,
        });

      if (movError) throw new Error(movError.message);

      // 2. Obtener stock actual
      const { data: current, error: fetchError } = await sb
        .from("ingredients")
        .select("stock_quantity")
        .eq("id", ingredientId)
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw new Error(fetchError.message);

      const newStock =
        movementType === "IN"
          ? current.stock_quantity + quantity
          : Math.max(0, current.stock_quantity - quantity);

      // 3. Actualizar stock
      const { error: updateError } = await sb
        .from("ingredients")
        .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
        .eq("id", ingredientId)
        .eq("user_id", user.id);

      if (updateError) throw new Error(updateError.message);

      return newStock;
    },
    onSuccess: (newStock) => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["stock-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["ingredient-movements"] });
      toast.success(`✓ Stock actualizado. Nuevo stock: ${newStock}`);
    },
    onError: (error) => {
      toast.error(`Error al ajustar stock: ${error.message}`);
    },
  });
}

export function useCreateCategory() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation<IngredientCategory, Error, string>({
    mutationFn: async (name) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("ingredient_categories")
        .insert({ name, user_id: user.id })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredient-categories"] });
      toast.success("Categoría creada");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}
