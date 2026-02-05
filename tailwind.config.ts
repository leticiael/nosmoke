import type { Config } from "tailwindcss";

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
        // Paleta Samuel Alexander - Elegante
        forest: {
          DEFAULT: '#044040',
          50: '#a8e6e6',
          100: '#6fd4d4',
          200: '#3bb8b8',
          300: '#0a7a7a',
          400: '#044040',
          500: '#033333',
          600: '#022626',
          700: '#011919',
          800: '#010d0d',
          900: '#000606',
        },
        wine: {
          DEFAULT: '#591C21',
          50: '#f5c4c9',
          100: '#e8929a',
          200: '#c9545f',
          300: '#8c2d36',
          400: '#591C21',
          500: '#48171b',
          600: '#371215',
          700: '#260c0e',
          800: '#150708',
          900: '#0a0304',
        },
        burgundy: {
          DEFAULT: '#8C1F28',
          50: '#f8c7cb',
          100: '#f0969e',
          200: '#d95560',
          300: '#b22b38',
          400: '#8C1F28',
          500: '#701920',
          600: '#541318',
          700: '#380d10',
          800: '#1c0608',
          900: '#0e0304',
        },
        crimson: {
          DEFAULT: '#D92525',
          50: '#fcd4d4',
          100: '#f8a8a8',
          200: '#f17070',
          300: '#e54545',
          400: '#D92525',
          500: '#b01e1e',
          600: '#871717',
          700: '#5e1010',
          800: '#350909',
          900: '#1a0404',
        },
        ivory: {
          DEFAULT: '#F2F2F2',
          50: '#ffffff',
          100: '#fafafa',
          200: '#F2F2F2',
          300: '#e0e0e0',
          400: '#c0c0c0',
          500: '#a0a0a0',
          600: '#808080',
          700: '#606060',
          800: '#404040',
          900: '#202020',
        },
        // Design system
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
