import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
    globalCss: {
        "html, body": {
            bg: "bg.canvas",
            color: "fg.default",
            colorPalette: "brand",
        },
        // Chakra UI v3 marks every component with data-scope / data-part attributes.
        // Override the surface background for card, dialog, drawer, menu, popover.
        "[data-scope='card'][data-part='root']": {
            bg: "bg.surface",
            color: "fg.default",
            borderWidth: "1px",
            borderColor: "border.default",
        },
        "[data-scope='dialog'][data-part='content']": {
            bg: "bg.surface",
            color: "fg.default",
            borderColor: "border.default",
        },
        "[data-scope='drawer'][data-part='content']": {
            bg: "bg.surface",
            color: "fg.default",
        },
        "[data-scope='menu'][data-part='content']": {
            bg: "bg.surface",
            color: "fg.default",
            borderColor: "border.default",
        },
        "[data-scope='menu'][data-part='item']": {
            color: "fg.default",
        },
        "[data-scope='popover'][data-part='content']": {
            bg: "bg.surface",
            color: "fg.default",
            borderColor: "border.default",
        },
        "[data-scope='select'][data-part='content']": {
            bg: "bg.surface",
            color: "fg.default",
            borderColor: "border.default",
        },
        // Form inputs / textarea — use data-scope for high specificity
        // (plain `input {}` loses to Chakra's recipe classes)
        "[data-scope='input'][data-part='input'], [data-scope='number-input'][data-part='input'], [data-scope='textarea'][data-part='textarea'], [data-scope='pin-input'][data-part='input']": {
            borderColor: "border.default",
            color: "fg.default",
            bg: "bg.surface",
        },
        "[data-scope='input'][data-part='input']::placeholder, [data-scope='textarea'][data-part='textarea']::placeholder": {
            color: "fg.subtle",
        },
        // Fallback for native inputs not wrapped by Chakra
        "input, textarea": {
            borderColor: "border.default",
            color: "fg.default",
        },
        // Table header rows
        "th": {
            color: "fg.muted",
            borderColor: "border.default",
        },
        "td": {
            borderColor: "border.default",
            color: "fg.default",
        },
    },
    theme: {
        tokens: {
            colors: {
                brand: {
                    50: { value: "#eff6ff" },
                    100: { value: "#dbeafe" },
                    200: { value: "#bfdbfe" },
                    300: { value: "#93c5fd" },
                    400: { value: "#60a5fa" },
                    500: { value: "#3b82f6" },
                    600: { value: "#2563eb" },
                    700: { value: "#1d4ed8" },
                    800: { value: "#1e40af" },
                    900: { value: "#1e3a8a" },
                },
            },
            fonts: {
                heading: { value: "var(--font-geist-sans), sans-serif" },
                body: { value: "var(--font-geist-sans), sans-serif" },
                mono: { value: "var(--font-geist-mono), monospace" },
            },
            radii: {
                sm: { value: "6px" },
                md: { value: "10px" },
                lg: { value: "14px" },
                xl: { value: "18px" },
                "2xl": { value: "24px" },
            },
        },

        semanticTokens: {
            colors: {
                // ── Page / surface backgrounds ─────────────────────────────────
                "bg.canvas": {
                    value: { base: "#f8fafc", _dark: "#0f172a" },
                },
                "bg.surface": {
                    value: { base: "#ffffff", _dark: "#1e293b" },
                },
                "bg.subtle": {
                    value: { base: "#f1f5f9", _dark: "#1e293b" },
                },
                "bg.muted": {
                    value: { base: "#e2e8f0", _dark: "#334155" },
                },

                // ── Foreground / text ──────────────────────────────────────────
                "fg.default": {
                    value: { base: "#0f172a", _dark: "#f1f5f9" },
                },
                "fg.muted": {
                    value: { base: "#475569", _dark: "#94a3b8" },
                },
                "fg.subtle": {
                    value: { base: "#94a3b8", _dark: "#64748b" },
                },

                // ── Borders ────────────────────────────────────────────────────
                // Override Chakra's native `border` token (used by Input/Select recipes)
                "border": {
                    value: { base: "#e2e8f0", _dark: "#475569" },
                },
                "border.default": {
                    value: { base: "#e2e8f0", _dark: "#475569" },
                },
                "border.subtle": {
                    value: { base: "#f1f5f9", _dark: "#334155" },
                },

                // ── Brand / accent (maps to blue palette) ─────────────────────
                "brand.solid": {
                    value: { base: "{colors.brand.600}", _dark: "{colors.brand.400}" },
                },
                "brand.muted": {
                    value: { base: "{colors.brand.50}", _dark: "{colors.brand.900}" },
                },
                "brand.subtle": {
                    value: { base: "{colors.brand.100}", _dark: "{colors.brand.900}" },
                },
                "brand.text": {
                    value: { base: "{colors.brand.700}", _dark: "{colors.brand.300}" },
                },
            },
        },
    },
});

export const system = createSystem(defaultConfig, config);
