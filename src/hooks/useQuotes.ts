import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type Quote = Database["public"]["Tables"]["quotes"]["Row"];
type QuoteInsert = Database["public"]["Tables"]["quotes"]["Insert"];
type QuoteUpdate = Database["public"]["Tables"]["quotes"]["Update"];

export function useQuotes() {
  const supabase = createBrowserClient();

  return useQuery<Quote[]>({
    queryKey: ["quotes"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await (supabase as any)
        .from("quotes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as Quote[];
    },
  });
}

export function useQuote(id: string) {
  const supabase = createBrowserClient();

  return useQuery<Quote | null>({
    queryKey: ["quote", id],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await (supabase as any)
        .from("quotes")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw new Error(error.message);
      return data as Quote;
    },
    enabled: !!id,
  });
}

export function useApprovedQuotes() {
  const supabase = createBrowserClient();

  return useQuery<Quote[]>({
    queryKey: ["quotes-approved"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await (supabase as any)
        .from("quotes")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as Quote[];
    },
  });
}

export function useCreateQuote() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quote: Omit<QuoteInsert, "user_id">) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await (supabase as any)
        .from("quotes")
        .insert({ ...quote, user_id: user.id })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Quote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Presupuesto creado exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al crear presupuesto: ${error.message}`);
    },
  });
}

export function useUpdateQuote() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: QuoteUpdate }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data, error } = await (supabase as any)
        .from("quotes")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Quote;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
      queryClient.invalidateQueries({ queryKey: ["quotes-approved"] });
      toast.success("Presupuesto actualizado");
    },
    onError: (error) => {
      toast.error(`Error al actualizar presupuesto: ${error.message}`);
    },
  });
}

export function useUpdateQuoteStatus() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "draft" | "sent" | "approved" | "rejected";
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { error } = await (supabase as any)
        .from("quotes")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quotes-approved"] });
      const labels: Record<string, string> = {
        draft: "Borrador",
        sent: "Enviado",
        approved: "Aprobado",
        rejected: "Rechazado",
      };
      toast.success(`Estado actualizado a: ${labels[status]}`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useDeleteQuote() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { error } = await (supabase as any)
        .from("quotes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Presupuesto eliminado");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}
