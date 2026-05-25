"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock, Store, ChefHat } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

const registerSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  business_name: z.string().optional(),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createBrowserClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            business_name: data.business_name ?? null,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Este email ya está registrado");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("¡Cuenta creada! Revisa tu email para confirmar.");
      router.push("/login");
    } catch {
      toast.error("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF5EC] flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#C43B2A] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-card">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[#2C1208] mb-2">
            Crea tu cuenta
          </h1>
          <p className="text-[#A07050]">
            Empieza a gestionar tu repostería gratis
          </p>
        </div>

        <div className="bg-white rounded-[12px] shadow-card border border-[#E8D5BE] p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-medium text-[#6B3A1F] mb-1.5">
                Nombre completo <span className="text-[#C43B2A]">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07050]" />
                <input
                  {...register("full_name")}
                  type="text"
                  placeholder="María González"
                  className="w-full pl-10 pr-4 py-3 border border-[#E8D5BE] rounded-[8px] bg-[#FFF8F3] text-[#2C1208] placeholder:text-[#A07050]/60 focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] focus:bg-white transition-all"
                  id="register-full-name"
                />
              </div>
              {errors.full_name && (
                <p className="mt-1 text-xs text-[#C43B2A]">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Nombre del emprendimiento */}
            <div>
              <label className="block text-sm font-medium text-[#6B3A1F] mb-1.5">
                Nombre del emprendimiento{" "}
                <span className="text-[#A07050] font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07050]" />
                <input
                  {...register("business_name")}
                  type="text"
                  placeholder="Dulces de María"
                  className="w-full pl-10 pr-4 py-3 border border-[#E8D5BE] rounded-[8px] bg-[#FFF8F3] text-[#2C1208] placeholder:text-[#A07050]/60 focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] focus:bg-white transition-all"
                  id="register-business-name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#6B3A1F] mb-1.5">
                Email <span className="text-[#C43B2A]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07050]" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-[#E8D5BE] rounded-[8px] bg-[#FFF8F3] text-[#2C1208] placeholder:text-[#A07050]/60 focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] focus:bg-white transition-all"
                  id="register-email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-[#C43B2A]">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-[#6B3A1F] mb-1.5">
                Contraseña <span className="text-[#C43B2A]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07050]" />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-10 pr-4 py-3 border border-[#E8D5BE] rounded-[8px] bg-[#FFF8F3] text-[#2C1208] placeholder:text-[#A07050]/60 focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] focus:bg-white transition-all"
                  id="register-password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-[#C43B2A]">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              id="register-submit"
              className="w-full py-3 px-4 bg-[#C43B2A] hover:bg-[#9B2A1B] text-white font-semibold rounded-[8px] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta gratis"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#A07050]">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-[#C43B2A] font-medium hover:text-[#9B2A1B] transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-[#A07050]">
          Al registrarte aceptas nuestros términos de uso y política de privacidad.
        </p>
      </div>
    </div>
  );
}
