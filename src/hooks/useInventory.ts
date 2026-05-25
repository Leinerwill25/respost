import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";

export interface FinishedInventoryWithRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  production_log_id: string | null;
  quantity_available: number;
  sale_price_usd: number;
  cost_price_usd: number;
  euro_rate_at_production: number;
  created_at: string;
  updated_at: string;
  recipes: {
    id: string;
    name: string;
    portions: number;
    portion_label: string | null;
    image_url: string | null;
    category: string | null;
  };
}

export function useInventory() {
  const supabase = createBrowserClient();

  return useQuery<FinishedInventoryWithRecipe[]>({
    queryKey: ["inventory"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await (supabase as any)
        .from("finished_inventory")
        .select(
          `
          *,
          recipes(id, name, portions, portion_label, image_url, category)
        `
        )
        .eq("user_id", user.id)
        .gt("quantity_available", 0)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as FinishedInventoryWithRecipe[];
    },
  });
}

export function useAllInventory() {
  const supabase = createBrowserClient();

  return useQuery<FinishedInventoryWithRecipe[]>({
    queryKey: ["inventory-all"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await (supabase as any)
        .from("finished_inventory")
        .select(
          `
          *,
          recipes(id, name, portions, portion_label, image_url, category)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as FinishedInventoryWithRecipe[];
    },
  });
}
