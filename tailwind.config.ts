import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces & Canvas
        surface: "#faf9f5",
        "surface-dim": "#dbdad6",
        "surface-bright": "#faf9f5",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f4f0",
        "surface-container": "#efeeea",
        "surface-container-high": "#e9e8e4",
        "surface-container-highest": "#e3e2df",
        "surface-variant": "#e3e2df",
        "surface-tint": "#5f5e5e",
        "inverse-surface": "#30312e",
        "inverse-on-surface": "#f2f1ed",

        // Typography & Borders
        "on-surface": "#1b1c1a",
        "on-surface-variant": "#444748",
        outline: "#747878",
        "outline-variant": "#c4c7c7",
        background: "#faf9f5",
        "on-background": "#1b1c1a",

        // Primary, Secondary, Tertiary
        primary: "#000000",
        "on-primary": "#ffffff",
        "primary-container": "#1c1b1b",
        "on-primary-container": "#858383",
        "inverse-primary": "#c8c6c5",
        "primary-fixed": "#e5e2e1",
        "primary-fixed-dim": "#c8c6c5",
        "on-primary-fixed": "#1c1b1b",
        "on-primary-fixed-variant": "#474646",

        secondary: "#5e5f5a",
        "on-secondary": "#ffffff",
        "secondary-container": "#deddd7",
        "on-secondary-container": "#61615c",
        "secondary-fixed": "#e4e2dc",
        "secondary-fixed-dim": "#c8c7c0",
        "on-secondary-fixed": "#1b1c18",
        "on-secondary-fixed-variant": "#474743",

        tertiary: "#000000",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#23005c",
        "on-tertiary-container": "#9466ff",
        "tertiary-fixed": "#e9ddff",
        "tertiary-fixed-dim": "#d0bcff",
        "on-tertiary-fixed": "#23005c",
        "on-tertiary-fixed-variant": "#5516be",

        // Alerts & Errors
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        // Trust Semantic Badges (Verification System)
        trust: {
          verified: "#2F7D5B",
          "verified-surface": "#E4F2EA",
          warning: "#B7791F",
          "warning-surface": "#FBF0DA",
          conflict: "#B4403A",
          "conflict-surface": "#FBE6E4",
          draft: "#5A5A58",
          "draft-surface": "#EAE9E4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      fontSize: {
        display: ["72px", { lineHeight: "76px", letterSpacing: "-0.035em", fontWeight: "700" }],
        "display-mobile": ["40px", { lineHeight: "44px", letterSpacing: "-0.025em", fontWeight: "700" }],
        "headline-lg": ["48px", { lineHeight: "52px", letterSpacing: "-0.03em", fontWeight: "600" }],
        "headline-lg-mobile": ["32px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-md": ["28px", { lineHeight: "34px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "26px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "26px", letterSpacing: "-0.005em", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", letterSpacing: "0em", fontWeight: "400" }],
        "label-md": ["13px", { lineHeight: "16px", letterSpacing: "0.01em", fontWeight: "500" }],
        "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.02em", fontWeight: "600" }],
      },
      borderRadius: {
        sm: "0.5rem",
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      spacing: {
        gutter: "1.5rem",
        "gutter-mobile": "1rem",
        margin: "3rem",
        "margin-mobile": "1.25rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
