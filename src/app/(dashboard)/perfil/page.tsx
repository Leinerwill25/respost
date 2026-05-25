"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User as UserIcon, Mail, Store, Sparkles, Check, Loader2, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const profileSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  business_name: z.string().nullable().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function PerfilPage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

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
