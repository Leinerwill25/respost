import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Rate = Database["public"]["Tables"]["rates"]["Row"];

export function useEuroRate() {
  const supabase = createBrowserClient();

  return useQuery<Pick<Rate, "rate" | "rate_datetime" | "curr_date" | "curr_time">>({
    queryKey: ["euro-rate"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("rates")
        .select("rate, rate_datetime, curr_date, curr_time")
        .eq("code", "EUR")
        .order("rate_datetime", { ascending: false })
        .limit(1)
        .single();

      if (error) throw new Error(error.message);
      return data as any;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
    refetchInterval: 1000 * 60 * 30,
  });
}
