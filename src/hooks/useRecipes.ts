import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
type RecipeInsert = Omit<Database["public"]["Tables"]["recipes"]["Insert"], "user_id">;
type RecipeUpdate = Database["public"]["Tables"]["recipes"]["Update"];
type RecipeIngredientInsert = Database["public"]["Tables"]["recipe_ingredients"]["Insert"];

export type RecipeWithIngredients = Recipe & {
  recipe_ingredients: Array<{
    id: string;
    ingredient_id: string;
    quantity: number;
    notes: string | null;
    ingredients: {
      id: string;
      name: string;
      unit: "g" | "kg" | "ml" | "l" | "unidades";
      package_size: number;
      price_usd: number;
      stock_quantity: number;
    };
  }>;
};

export function useRecipes() {
  const supabase = createBrowserClient();

  return useQuery<Recipe[]>({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw new Error(error.message);
      return (data ?? []) as Recipe[];
    },
  });
}

export function useRecipe(id: string) {
  const supabase = createBrowserClient();

  return useQuery<RecipeWithIngredients | null>({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("recipes")
        .select(`
          *,
          recipe_ingredients(
            id,
            ingredient_id,
            quantity,
            notes,
            ingredients(id, name, unit, package_size, price_usd, stock_quantity)
          )
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) return null;
      return data as RecipeWithIngredients;
    },
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation<
    Recipe,
    Error,
    { recipe: RecipeInsert; ingredients: Omit<RecipeIngredientInsert, "recipe_id">[] }
  >({
    mutationFn: async ({ recipe, ingredients }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      // 1. Crear receta
      const { data: newRecipe, error: recipeError } = await sb
        .from("recipes")
        .insert({ ...recipe, user_id: user.id })
        .select()
        .single();

      if (recipeError) throw new Error(recipeError.message);

      // 2. Insertar ingredientes de la receta
      if (ingredients.length > 0) {
        const { error: ingError } = await sb
          .from("recipe_ingredients")
          .insert(ingredients.map((ing) => ({ ...ing, recipe_id: newRecipe.id })));

        if (ingError) throw new Error(ingError.message);
      }

      return newRecipe as Recipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Receta creada exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al crear receta: ${error.message}`);
    },
  });
}

export function useUpdateRecipe() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: string; recipe: RecipeUpdate; ingredients: Omit<RecipeIngredientInsert, "recipe_id">[] }
  >({
    mutationFn: async ({ id, recipe, ingredients }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      // 1. Actualizar receta
      const { error: recipeError } = await sb
        .from("recipes")
        .update({ ...recipe, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);

      if (recipeError) throw new Error(recipeError.message);

      // 2. Eliminar ingredientes y reemplazar
      await sb.from("recipe_ingredients").delete().eq("recipe_id", id);

      if (ingredients.length > 0) {
        const { error: ingError } = await sb
          .from("recipe_ingredients")
          .insert(ingredients.map((ing) => ({ ...ing, recipe_id: id })));

        if (ingError) throw new Error(ingError.message);
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipe", id] });
      toast.success("Receta actualizada");
    },
    onError: (error) => {
      toast.error(`Error al actualizar receta: ${error.message}`);
    },
  });
}

export function useDeleteRecipe() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("recipes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Receta eliminada");
    },
    onError: (error) => {
      toast.error(`Error al eliminar receta: ${error.message}`);
    },
  });
}
