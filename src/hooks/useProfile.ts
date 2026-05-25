import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useProfile() {
  const supabase = createBrowserClient();

  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw new Error(error.message);
      return data as Profile;
    },
  });
}

export function useUpdateProfile() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      full_name?: string;
      business_name?: string | null;
      rate_mode?: "auto" | "manual";
      manual_rate_value?: number | null;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const payload: any = {
        updated_at: new Date().toISOString(),
      };
      if (params.full_name !== undefined) payload.full_name = params.full_name;
      if (params.business_name !== undefined) payload.business_name = params.business_name;
      if (params.rate_mode !== undefined) payload.rate_mode = params.rate_mode;
      if (params.manual_rate_value !== undefined) payload.manual_rate_value = params.manual_rate_value;

      const { data, error } = await (supabase as any)
        .from("profiles")
        .update(payload)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["euro-rate"] });
      toast.success("✓ Configuración actualizada exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al actualizar configuración: ${error.message}`);
    },
  });
}
