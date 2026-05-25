import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { useProfile } from "./useProfile";

type Rate = Database["public"]["Tables"]["rates"]["Row"];

export function useEuroRate() {
  const supabase = createBrowserClient();
  const { data: profile } = useProfile();

  const rateMode = profile?.rate_mode;
  const manualRateVal = profile?.manual_rate_value;

  return useQuery<Pick<Rate, "rate" | "rate_datetime" | "curr_date" | "curr_time"> & { is_manual?: boolean }>({
    queryKey: ["euro-rate", rateMode, manualRateVal],
    queryFn: async () => {
      // 1. Obtener preferencias locales como fallback inmediato/persistente
      const localMode = typeof window !== "undefined" ? localStorage.getItem("pp_rate_mode") : null;
      const localRate = typeof window !== "undefined" ? localStorage.getItem("pp_manual_rate_value") : null;

      const activeMode = rateMode ?? localMode ?? "auto";
      const activeManualValue = manualRateVal ?? (localRate ? parseFloat(localRate) : null);

      if (activeMode === "manual" && activeManualValue !== null && !isNaN(activeManualValue)) {
        return {
          rate: activeManualValue,
          rate_datetime: new Date().toISOString(),
          curr_date: new Date().toISOString().split("T")[0],
          curr_time: new Date().toTimeString().split(" ")[0],
          is_manual: true,
        };
      }

      // Por defecto: Tasa automática desde la base de datos
      const { data, error } = await (supabase as any)
        .from("rates")
        .select("rate, rate_datetime, curr_date, curr_time")
        .eq("code", "EUR")
        .order("rate_datetime", { ascending: false })
        .limit(1)
        .single();

      if (error) throw new Error(error.message);
      return {
        ...data,
        is_manual: false,
      } as any;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
    refetchInterval: 1000 * 60 * 30,
  });
}
