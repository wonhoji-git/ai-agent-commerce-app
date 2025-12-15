import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Card
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Popover
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        // Primary (Indigo)
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        // Secondary
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        // Muted
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        // Accent
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        // Destructive
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        // Border, Input, Ring
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Agent colors
        agent: {
          supervisor: "#6366F1",
          md: "#8B5CF6",
          cs: "#06B6D4",
          display: "#F59E0B",
          purchase: "#10B981",
          logistics: "#EF4444",
          marketing: "#EC4899",
        },

        // Status colors
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
      },

      fontFamily: {
        sans: ["var(--font-geist-sans)", "var(--font-pretendard)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      boxShadow: {
        "glow-indigo": "0 0 20px rgba(99, 102, 241, 0.15)",
        "glow-indigo-sm": "0 0 10px rgba(99, 102, 241, 0.1)",
        "card": "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 10px 40px rgba(99, 102, 241, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-slide-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        "typing": {
          "0%": { opacity: "0.4" },
          "20%": { opacity: "1" },
          "100%": { opacity: "0.4" },
        },
      },

      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "fade-slide-in": "fade-slide-in 0.3s ease-out",
        "pulse-dot": "pulse-dot 1.4s ease-in-out infinite",
        "typing-1": "typing 1.4s ease-in-out infinite",
        "typing-2": "typing 1.4s ease-in-out 0.2s infinite",
        "typing-3": "typing 1.4s ease-in-out 0.4s infinite",
      },
    },
  },
  plugins: [typography],
};

export default config;
