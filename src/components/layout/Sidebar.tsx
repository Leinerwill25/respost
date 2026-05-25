"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Factory,
  Archive,
  FileText,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { createBrowserClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", emoji: "📊" },
  { href: "/insumos", label: "Insumos", emoji: "📦" },
  { href: "/recetas", label: "Recetas", emoji: "🧁" },
  { href: "/produccion", label: "Producción", emoji: "🏭" },
  { href: "/inventario", label: "Inventario", emoji: "🗃️" },
  { href: "/presupuestos", label: "Presupuestos", emoji: "📋" },
  { href: "/ventas", label: "Ventas", emoji: "💰" },
  { href: "/reportes", label: "Reportes", emoji: "📈" },
  { href: "/perfil", label: "Configuración", emoji: "⚙️" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: profile } = useProfile();
  const supabase = createBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[var(--bg-card)] border-r border-[var(--border-default)]
          shadow-sm z-40 flex flex-col transition-transform duration-300 font-sans
          lg:translate-x-0 lg:static lg:z-auto lg:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[var(--border-default)]">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🧁</span>
              <span className="font-display text-xl font-bold text-[var(--text-heading)] tracking-tight">
                Pastry<span className="text-[var(--red-600)] font-extrabold">Pro</span>
              </span>
            </Link>
            {/* Mobile close */}
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 py-2.5 px-3.5 transition-all duration-200 group text-sm
                  ${
                    isActive
                      ? "bg-[var(--red-100)] text-[var(--red-600)] border-l-[3px] border-[var(--red-600)] rounded-r-[var(--radius-md)] pl-[11px] font-semibold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--red-600)] rounded-[var(--radius-md)]"
                  }
                `}
              >
                <span className="text-base flex-shrink-0">{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-[#E8D5BE] mt-auto">
          {profile && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#C43B2A] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  {profile.full_name
                    ? profile.full_name.substring(0, 2).toUpperCase()
                    : "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2C1208] truncate">
                    {profile.full_name || "Usuario"}
                  </p>
                  <p className="text-[10px] text-[#6B3A1F] truncate">
                    {profile.business_name || "Mi Repostería"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-md text-[#A07050] hover:text-[#C43B2A] hover:bg-[#FFF8F3] transition-colors shrink-0"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
