import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type Sale = Database["public"]["Tables"]["sales"]["Row"];

export function useSales() {
  const supabase = createBrowserClient();

  return useQuery<Sale[]>({
    queryKey: ["sales"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await (supabase as any)
        .from("sales")
        .select("*")
        .eq("user_id", user.id)
        .order("sold_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as Sale[];
    },
  });
}

export function useMonthlySales() {
  const supabase = createBrowserClient();

  return useQuery<Pick<Sale, "total_price_usd" | "profit_usd" | "total_price_bs" | "sold_at">[]>({
    queryKey: ["sales-monthly"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await (supabase as any)
        .from("sales")
        .select("total_price_usd, profit_usd, total_price_bs, sold_at")
        .eq("user_id", user.id)
        .gte("sold_at", startOfMonth.toISOString());

      if (error) throw new Error(error.message);
      return (data ?? []) as any[];
    },
  });
}

export function useSalesLast30Days() {
  const supabase = createBrowserClient();

  return useQuery<Pick<Sale, "total_price_usd" | "profit_usd" | "sold_at">[]>({
    queryKey: ["sales-30days"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await (supabase as any)
        .from("sales")
        .select("total_price_usd, profit_usd, sold_at")
        .eq("user_id", user.id)
        .gte("sold_at", thirtyDaysAgo.toISOString())
        .order("sold_at", { ascending: true });

      if (error) throw new Error(error.message);
      return (data ?? []) as any[];
    },
  });
}

export function useCreateSale() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      sale_type: "inventory" | "quote" | "manual";
      finished_inventory_id?: string;
      quote_id?: string;
      product_description?: string;
      quantity: number;
      unit_price_usd: number;
      unit_cost_usd?: number;
      euro_rate: number;
      client_name?: string;
      payment_method?: string;
      notes?: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await (supabase as any).rpc("process_sale", {
        p_user_id: user.id,
        p_sale_type: params.sale_type,
        p_finished_inventory_id: params.finished_inventory_id,
        p_quote_id: params.quote_id,
        p_product_description: params.product_description,
        p_quantity: params.quantity,
        p_unit_price_usd: params.unit_price_usd,
        p_unit_cost_usd: params.unit_cost_usd ?? 0,
        p_euro_rate: params.euro_rate,
        p_client_name: params.client_name,
        p_payment_method: params.payment_method,
        p_notes: params.notes,
      });

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales-monthly"] });
      queryClient.invalidateQueries({ queryKey: ["sales-30days"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-all"] });
      toast.success("✓ Venta registrada exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al registrar venta: ${error.message}`);
    },
  });
}
