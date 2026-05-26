"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User as UserIcon, Mail, Store, Sparkles, Check, Loader2, ShieldCheck, TrendingUp, RefreshCw, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { createBrowserClient } from "@/lib/supabase/client";

const profileSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  business_name: z.string().nullable().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function PerfilPage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [rateMode, setRateMode] = useState<"auto" | "manual">("auto");
  const [manualRateValue, setManualRateValue] = useState<string>("");
  const [ratesHistory, setRatesHistory] = useState<any[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [savingRate, setSavingRate] = useState(false);

  useEffect(() => {
    if (profile) {
      const localMode = typeof window !== "undefined" ? localStorage.getItem("pp_rate_mode") as "auto" | "manual" | null : null;
      const localRate = typeof window !== "undefined" ? localStorage.getItem("pp_manual_rate_value") : null;

      setRateMode(profile.rate_mode ?? localMode ?? "auto");
      setManualRateValue(profile.manual_rate_value?.toString() ?? localRate ?? "");
    }
  }, [profile]);

  const fetchRates = async () => {
    setLoadingRates(true);
    try {
      const supabase = createBrowserClient();
      const { data, error } = await (supabase as any)
        .from("rates")
        .select("*")
        .order("rate_datetime", { ascending: false })
        .limit(10);
      if (!error && data) {
        setRatesHistory(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericRate = parseFloat(manualRateValue);
    if (rateMode === "manual" && (isNaN(numericRate) || numericRate <= 0)) {
      toast.error("Por favor ingresa una tasa manual válida mayor a 0");
      return;
    }

    setSavingRate(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("pp_rate_mode", rateMode);
      if (rateMode === "manual") {
        localStorage.setItem("pp_manual_rate_value", numericRate.toString());
      }
    }

    try {
      await updateProfile.mutateAsync({
        rate_mode: rateMode,
        manual_rate_value: rateMode === "manual" ? numericRate : null,
      });
    } catch (err: any) {
      console.warn("No se pudo persistir en base de datos. Se aplicó localmente.");
      toast.success("✓ Configuración de tasa aplicada localmente en este navegador");
    } finally {
      setSavingRate(false);
    }
  };

  const handleUseRate = (val: number) => {
    setRateMode("manual");
    setManualRateValue(val.toString());
    toast.info(`Seleccionaste ${val.toFixed(2)} Bs. Haz clic en "Guardar Tasa" para aplicar.`);
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      business_name: "",
    },
  });

  useEffect(() => {
    if (profile) {
      setValue("full_name", profile.full_name);
      setValue("business_name", profile.business_name || "");
    }
  }, [profile, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync({
        full_name: data.full_name,
        business_name: data.business_name || null,
      });
    } catch (error: any) {
      toast.error(`Error al actualizar el perfil: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C43B2A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Perfil"
        subtitle="Administra la información de tu cuenta y los detalles de tu suscripción"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Perfil" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Info Form */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <CardHeader
                title="Información de la Cuenta"
                subtitle="Actualiza tus datos de contacto y el nombre de tu emprendimiento"
                icon={<UserIcon className="w-5 h-5" />}
              />

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-[#6B3A1F] mb-1.5">
                      Nombre completo
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07050]" />
                      <input
                        {...register("full_name")}
                        type="text"
                        placeholder="María González"
                        className="w-full pl-10 pr-4 py-2.5 border border-[#E8D5BE] rounded-[12px] bg-white text-[#2C1208] placeholder:text-[#A07050]/60 focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] transition-all text-sm"
                      />
                    </div>
                    {errors.full_name && (
                      <p className="mt-1 text-xs text-[#C43B2A]">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B3A1F] mb-1.5">
                      Nombre del emprendimiento
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07050]" />
                      <input
                        {...register("business_name")}
                        type="text"
                        placeholder="Dulces de María"
                        className="w-full pl-10 pr-4 py-2.5 border border-[#E8D5BE] rounded-[12px] bg-white text-[#2C1208] placeholder:text-[#A07050]/60 focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B3A1F] mb-1.5">
                    Correo electrónico (no modificable)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07050]/50" />
                    <input
                      type="email"
                      value={profile?.email || ""}
                      readOnly
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-[#E8D5BE] rounded-[12px] bg-[#F5EDE0] text-[#A07050] cursor-not-allowed text-sm"
                    />
                  </div>
                  <p className="text-xs text-[#A07050] mt-1.5">
                    El correo electrónico está vinculado a tu cuenta de autenticación.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={updateProfile.isPending}
                    leftIcon={<ShieldCheck className="w-4 h-4" />}
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          {/* Configuración de Tasa Cambiaria */}
          <Card className="mt-6">
            <div className="p-6">
              <CardHeader
                title="Configuración de Tasa Cambiaria"
                subtitle="Elige si deseas usar la tasa automática del sistema o una personalizada"
                icon={<TrendingUp className="w-5 h-5" />}
              />

              <form onSubmit={handleSaveRate} className="space-y-5 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-[#6B3A1F] mb-1.5">
                      Modo de Tasa
                    </label>
                    <select
                      value={rateMode}
                      onChange={(e) => setRateMode(e.target.value as "auto" | "manual")}
                      className="w-full px-4 py-2.5 border border-[#E8D5BE] rounded-[12px] bg-white text-[#2C1208] focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] text-sm"
                    >
                      <option value="auto">Automático (Tasa BCV del día)</option>
                      <option value="manual">Manual (Personalizada)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B3A1F] mb-1.5">
                      Tasa Manual (Bs. por EUR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      disabled={rateMode === "auto"}
                      value={manualRateValue}
                      onChange={(e) => setManualRateValue(e.target.value)}
                      placeholder="Ej: 615.50"
                      className="w-full px-4 py-2.5 border border-[#E8D5BE] rounded-[12px] bg-white text-[#2C1208] placeholder:text-[#A07050]/60 focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] transition-all text-sm disabled:bg-[#F5EDE0] disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={savingRate}
                    leftIcon={<ShieldCheck className="w-4 h-4" />}
                  >
                    Guardar Tasa
                  </Button>
                </div>
              </form>

              {/* Historial de tasas en la base de datos */}
              <div className="mt-8 border-t border-[#E8D5BE] pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-display font-semibold text-[#2C1208]">Tasas en Base de Datos</h4>
                    <p className="text-xs text-[#A07050]">Historial extraído de Supabase</p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchRates}
                    disabled={loadingRates}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAE8E5] hover:bg-[#F4C5BC] text-[#6B3A1F] font-semibold rounded-[8px] text-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingRates ? "animate-spin" : ""}`} />
                    Actualizar
                  </button>
                </div>

                {loadingRates ? (
                  <div className="py-8 text-center text-[#A07050]">
                    <div className="animate-spin w-6 h-6 border-2 border-[#C43B2A] border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-xs">Cargando tasas...</p>
                  </div>
                ) : ratesHistory.length === 0 ? (
                  <div className="py-8 text-center bg-[#FDF5EC] rounded-[12px] border border-dashed border-[#E8D5BE]">
                    <AlertTriangle className="w-6 h-6 text-[#A07050] mx-auto mb-2" />
                    <p className="text-xs text-[#6B3A1F] font-medium">No se encontraron tasas en la tabla `rates`</p>
                  </div>
                ) : (
                  <div className="overflow-hidden border border-[#E8D5BE] rounded-[12px]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F5EDE0] text-[#6B3A1F] uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-2.5">Fecha</th>
                          <th className="px-4 py-2.5 hidden sm:table-cell">Código</th>
                          <th className="px-4 py-2.5 text-right">Valor</th>
                          <th className="px-4 py-2.5 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8D5BE]">
                        {ratesHistory.map((r) => (
                          <tr key={r.id} className="hover:bg-[#FDF3F1] transition-colors">
                            <td className="px-4 py-2 text-[#2C1208] font-medium">
                              {new Date(r.rate_datetime).toLocaleDateString("es-VE", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-4 py-2 text-[#6B3A1F] font-semibold hidden sm:table-cell">{r.code}</td>
                            <td className="px-4 py-2 text-right font-bold text-[#2C1208]">
                              {r.rate.toFixed(2)} Bs
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleUseRate(r.rate)}
                                className="px-2.5 py-1 bg-[#C43B2A] text-white hover:bg-[#9B2A1B] text-[11px] font-bold rounded-[6px] transition-colors cursor-pointer"
                              >
                                Usar esta tasa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right: SaaS plan details */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden relative">
            <div className="p-6">
              <CardHeader
                title="Detalles del Plan"
                icon={<Sparkles className="w-5 h-5" />}
              />

              <div className="mt-4 p-4 bg-[#FAE8E5] border border-[#F4C5BC] rounded-[12px] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#C43B2A] uppercase tracking-wider">
                    Plan Actual
                  </span>
                  <h4 className="text-xl font-bold text-[#2C1208] mt-0.5">
                    {profile?.plan === "pro" ? "PastryPro Pro 👑" : "PastryPro Gratis 🍰"}
                  </h4>
                </div>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-[#C43B2A] border border-[#FAE8E5] shadow-sm">
                  {profile?.plan === "pro" ? "Activo" : "Free"}
                </span>
              </div>

              {profile?.plan === "free" ? (
                <div className="mt-6 space-y-4">
                  <h5 className="text-xs font-bold text-[#2C1208] uppercase tracking-wider">
                    Desbloquea todo el potencial Pro:
                  </h5>
                  <ul className="space-y-2 text-sm text-[#6B3A1F]">
                    {[
                      "Creación ilimitada de recetas",
                      "Alertas de stock mínimo avanzadas",
                      "Doble moneda (USD/Bs) en tiempo real",
                      "Presupuestos y PDF personalizados",
                      "Reportes financieros detallados",
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => toast.info("Funcionalidad de pago simulada: ¡Estás listo para actualizar a Pro!")}
                    className="w-full mt-4 py-3 px-4 bg-[#C43B2A] hover:bg-[#9B2A1B] text-white font-semibold rounded-[12px] transition-all duration-300 shadow-[0_4px_16px_rgba(196,59,42,0.25)] hover:shadow-[0_8px_24px_rgba(196,59,42,0.30)] hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    Actualizar a Pro
                  </button>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-[#EDF7EE] border border-[#C8E6C9] rounded-[12px] text-[#2E7D32] text-sm">
                    ✨ Gracias por ser un cliente Pro. Tienes acceso ilimitado a todas las herramientas de PastryPro.
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
