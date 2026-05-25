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
    mutationFn: async (params: { full_name: string; business_name: string | null }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await (supabase as any)
        .from("profiles")
        .update({
          full_name: params.full_name,
          business_name: params.business_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("✓ Perfil actualizado exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al actualizar perfil: ${error.message}`);
    },
  });
}
