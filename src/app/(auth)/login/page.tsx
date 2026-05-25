"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Lock, Mail, ChefHat } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createBrowserClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email o contraseña incorrectos");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("¡Bienvenida de vuelta!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF5EC] flex">
      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#C43B2A] to-[#9B2A1B] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/30"
              style={{
                width: `${Math.random() * 200 + 50}px`,
                height: `${Math.random() * 200 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center text-white">
          <img src="/images/logo.png" alt="Logo PastryPro" className="w-20 h-20 rounded-2xl mx-auto mb-6 object-cover shadow-sm bg-white p-2 border border-white/10" />
          <h1 className="font-display text-5xl font-bold mb-4 leading-tight">
            PastryPro
          </h1>
          <p className="text-white/80 text-xl max-w-sm leading-relaxed">
            Tu negocio de repostería, organizado y rentable.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-sm">
            {[
              { label: "Insumos", desc: "Control total de materiales" },
              { label: "Recetas", desc: "Calcula tu precio justo" },
              { label: "Ventas", desc: "USD y Bs en tiempo real" },
              { label: "Reportes", desc: "Analiza tu rentabilidad" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left"
              >
                <div className="font-semibold text-white">{feature.label}</div>
                <div className="text-white/70 text-xs mt-1">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/images/logo.png" alt="Logo PastryPro" className="w-10 h-10 rounded-xl object-cover bg-white p-1 border border-[#E8D5BE]" />
            <span className="font-display text-2xl font-bold text-[#2C1208]">
              PastryPro
            </span>
          </div>

          <h2 className="font-display text-3xl font-bold text-[#2C1208] mb-2">
            Bienvenida 👋
          </h2>
          <p className="text-[#A07050] mb-8">
            Ingresa a tu cuenta para continuar
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#6B3A1F] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07050]" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-[#E8D5BE] rounded-[8px] bg-white text-[#2C1208] placeholder:text-[#A07050]/60 focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] transition-all"
                  id="login-email"
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
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07050]" />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-[#E8D5BE] rounded-[8px] bg-white text-[#2C1208] placeholder:text-[#A07050]/60 focus:outline-none focus:ring-2 focus:ring-[#FAE8E5] focus:border-[#C43B2A] transition-all"
                  id="login-password"
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
              id="login-submit"
              className="w-full py-3 px-4 bg-[#C43B2A] hover:bg-[#9B2A1B] text-white font-semibold rounded-[8px] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#A07050]">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-[#C43B2A] font-medium hover:text-[#9B2A1B] transition-colors"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
