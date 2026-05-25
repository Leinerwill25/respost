# PastryPro 🍰

SaaS de gestión para emprendedoras de repostería. Controla insumos, recetas, producción, ventas, inventario y presupuestos — con precios en USD y Bs (bolívares) en tiempo real.

## Stack tecnológico

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Base de datos & Auth:** Supabase (PostgreSQL + Row Level Security)
- **Estilos:** Tailwind CSS v4
- **Estado del servidor:** TanStack React Query
- **Gráficos:** Chart.js / react-chartjs-2
- **Validación:** Zod + React Hook Form
- **Notificaciones:** Sonner

## Funcionalidades principales

| Módulo | Descripción |
|---|---|
| Dashboard | KPIs en tiempo real, gráfico de ventas, alertas de stock |
| Insumos | Inventario de materias primas con historial de movimientos |
| Recetas | Calculadora de precio con 3 métodos (%, fijo, multiplicador) |
| Producción | Registro de lotes, descuento automático de insumos |
| Inventario | Stock de productos terminados valorizado en USD/Bs |
| Ventas | Registro de ventas con tasa EUR del día |
| Presupuestos | Cotizaciones con constructor visual y PDF |
| Reportes | Análisis financiero por período |
| Perfil | Gestión de cuenta y plan (Free / Pro) |

## Variables de entorno requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes claves (obtenidas desde tu proyecto de Supabase):

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Instalación local

```bash
# Instalar dependencias
pnpm install

# Correr en desarrollo
pnpm dev

# Build de producción
pnpm build
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/          # Login y registro
│   ├── (dashboard)/     # Todas las páginas del dashboard
│   └── globals.css      # Variables CSS del sistema de diseño
├── components/
│   ├── layout/          # Sidebar, Header, PageHeader
│   ├── ui/              # Button, Card, Badge, Input, Modal...
│   ├── ingredients/     # Componentes de insumos
│   ├── quotes/          # Builder y preview de presupuestos
│   └── recipes/         # Editor de ingredientes, calculadora
├── hooks/               # React Query hooks por módulo
├── lib/                 # Supabase client, utilidades de moneda
└── types/               # Tipos TypeScript globales
```

## Sistema de diseño

Paleta cálida basada en tonos rojo/marrón/crema:

| Token | Color | Uso |
|---|---|---|
| `--red-600` | `#C43B2A` | Acento primario, botones, enlaces |
| `--bg-page` | `#FDF5EC` | Fondo general |
| `--bg-card` | `#FFFFFF` | Fondo de tarjetas |
| `--text-heading` | `#2C1208` | Títulos |
| `--text-muted` | `#A07050` | Texto secundario |
| `--border-default` | `#E8D5BE` | Bordes de inputs y cards |

Tipografía: **Playfair Display** (display) · **DM Sans** (cuerpo)

## Despliegue

El proyecto está optimizado para desplegarse en [Vercel](https://vercel.com). Solo conecta el repositorio y configura las variables de entorno en el panel de Vercel.
