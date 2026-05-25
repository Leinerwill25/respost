import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type ProductionLog = Database["public"]["Tables"]["production_logs"]["Row"] & {
  recipes?: { id: string; name: string; portions: number; portion_label: string | null } | null;
};

export function useProduction() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation<
    string,
    Error,
    {
      recipe_id: string;
      quantity_produced: number;
      euro_rate: number;
      total_cost_usd: number;
      total_cost_bs: number;
      sale_price_usd: number;
      cost_price_usd: number;
      notes?: string;
    }
  >({
    mutationFn: async (params) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("process_production", {
        p_user_id: user.id,
        p_recipe_id: params.recipe_id,
        p_quantity_produced: params.quantity_produced,
        p_euro_rate: params.euro_rate,
        p_total_cost_usd: params.total_cost_usd,
        p_total_cost_bs: params.total_cost_bs,
        p_sale_price_usd: params.sale_price_usd,
        p_cost_price_usd: params.cost_price_usd,
        p_notes: params.notes,
      });

      if (error) throw new Error(error.message);
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["stock-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-all"] });
      queryClient.invalidateQueries({ queryKey: ["production-logs"] });
      toast.success("✓ Producción registrada exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al registrar producción: ${error.message}`);
    },
  });
}

export function useProductionLogs() {
  const supabase = createBrowserClient();

  return useQuery<ProductionLog[]>({
    queryKey: ["production-logs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("production_logs")
        .select("*, recipes(id, name, portions, portion_label)")
        .eq("user_id", user.id)
        .order("produced_at", { ascending: false })
        .limit(50);

      if (error) throw new Error(error.message);
      return (data ?? []) as ProductionLog[];
    },
  });
}
