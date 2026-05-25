import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Redefined core keys for automatic theme propagation across the dashboard
        primary: {
          DEFAULT: "var(--red-600)", /* #C43B2A */
          light: "var(--red-100)",   /* #FAE8E5 */
          dark: "var(--red-700)",    /* #9B2A1B */
        },
        bg: {
          DEFAULT: "var(--bg-page)",     /* #FDF5EC */
          surface: "var(--bg-card)",     /* #FFFFFF */
          surface2: "var(--bg-muted)",   /* #F5EDE0 */
        },
        border: {
          DEFAULT: "var(--border-default)", /* #E8D5BE */
        },
        text: {
          primary: "var(--text-heading)",     /* #2C1208 */
          secondary: "var(--text-secondary)", /* #6B3A1F */
          muted: "var(--text-muted)",         /* #A07050 */
        },
        success: "#2E7D32",
        warning: "#E65100",
        danger: "#C43B2A",
        info: "#1565C0",

        // Specific color extensions as requested in prompt section 8
        brand: {
          50:  '#FDF3F1',
          100: '#FAE8E5',
          200: '#F4C5BC',
          300: '#E89080',
          400: '#D85F4A',
          500: '#C43B2A',  /* principal */
          600: '#9B2A1B',
          700: '#7A1E12',
          800: '#5C150D',
        },
        cream: {
          50:  '#FFFDF9',
          100: '#FDF5EC',
          200: '#F5EDE0',
          300: '#E8D5BE',
        },
        warmBrown: {
          900: '#2C1208',
          700: '#4A2010',
          500: '#6B3A1F',
          300: '#A07050',
        }
      },
      fontFamily: {
        display: ["var(--font-display)", 'Nunito', 'sans-serif'],
        sans: ["var(--font-body)", 'DM Sans', 'sans-serif'],
        body: ["var(--font-body)", 'DM Sans', 'sans-serif'],
        script: ["var(--font-script)", 'Dancing Script', 'cursive'],
      },
      borderRadius: {
        card: "var(--radius-lg)", /* 20px */
        input: "var(--radius-md)", /* 12px */
        'xl': 'var(--radius-lg)', /* 20px */
        '2xl': 'var(--radius-xl)', /* 28px */
      },
      boxShadow: {
        card: "var(--shadow-card)", /* 0 2px 12px rgba(44, 18, 8, 0.07) */
        brand: "var(--shadow-md)",  /* 0 4px 16px rgba(196, 59, 42, 0.10) */
        "card-hover": "0 8px 32px rgba(196, 59, 42, 0.14)",
        modal: "var(--shadow-lg)",  /* 0 8px 32px rgba(196, 59, 42, 0.14) */
      },
    },
  },
  plugins: [],
};

export default config;
