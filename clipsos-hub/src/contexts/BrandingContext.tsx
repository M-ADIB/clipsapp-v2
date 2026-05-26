/**
 * BrandingContext — dynamic theme + logo configuration.
 *
 * Loads branding from `tenants.brand_colors` (colors) and
 * `tenants.settings` (logo, active theme mode).
 *
 * Shape of `brand_colors` JSONB:
 * {
 *   dark: { background, sidebar, surface_card, primary, primary_glow, ... },
 *   light: { background, sidebar, surface_card, primary, primary_glow, ... }
 * }
 *
 * Shape of `settings` JSONB (branding keys only):
 * {
 *   theme_mode: "dark" | "light",
 *   app_name: "ClipsApp",
 *   logo_url: "https://..." (optional — replaces text name everywhere),
 *   ...other settings
 * }
 *
 * When colors are set, this context injects them as CSS custom properties
 * on <html>, overriding the defaults from styles.css.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/db-types";
import { useAuth } from "./AuthContext";

/* ── Types ──────────────────────────────────────────────────── */

export interface ThemeColors {
  background?: string;
  surface?: string;
  surface_card?: string;
  surface_card_2?: string;
  sidebar?: string;
  surface_raised?: string;
  surface_input?: string;
  surface_muted?: string;
  foreground?: string;
  foreground_strong?: string;
  foreground_muted?: string;
  foreground_disabled?: string;
  primary?: string;
  primary_foreground?: string;
  primary_glow?: string;
  border?: string;
  border_strong?: string;
}

export interface BrandColors {
  dark?: ThemeColors;
  light?: ThemeColors;
}

export type ThemeMode = "dark" | "light";

export interface BrandingSettings {
  theme_mode?: ThemeMode;
  app_name?: string;
  /** Single logo URL — replaces the text app name everywhere (sidebar, login, etc.) */
  logo_url?: string;
}

export interface BrandingState {
  /** Current theme mode */
  mode: ThemeMode;
  /** Toggle between light and dark mode */
  toggleMode: () => void;
  /** Set mode explicitly */
  setMode: (mode: ThemeMode) => void;
  /** Active color overrides for current mode */
  colors: ThemeColors;
  /** Full brand_colors config (both modes) */
  brandColors: BrandColors;
  /** Branding-specific settings */
  brandingSettings: BrandingSettings;
  /** The single logo URL (null = use text app name instead) */
  logoUrl: string | null;
  /** The app display name */
  appName: string;
  /** Whether branding data is loading */
  isLoading: boolean;
  /** Save branding changes to Supabase */
  saveBranding: (
    brandColors: BrandColors,
    settings: Partial<BrandingSettings>,
  ) => Promise<{ error: string | null }>;
}

const BrandingContext = createContext<BrandingState | undefined>(undefined);

/* ── Default colors (match styles.css dark mode) ─────────── */

const DEFAULT_DARK: ThemeColors = {
  background: "#131314",
  surface: "#1C1B1C",
  surface_card: "#1E1C1D",
  surface_card_2: "#201F20",
  sidebar: "#18181B",
  surface_raised: "#2B2930",
  surface_input: "#36343B",
  surface_muted: "#353436",
  foreground: "#FFFFFF",
  foreground_strong: "#E5E2E3",
  foreground_muted: "#CDC3D0",
  foreground_disabled: "#939193",
  primary: "#ECD7FF",
  primary_foreground: "#131314",
  primary_glow: "#D8B4FE",
  border: "rgba(255,255,255,0.08)",
  border_strong: "rgba(255,255,255,0.20)",
};

const DEFAULT_LIGHT: ThemeColors = {
  background: "#FFFFFF",
  surface: "#F7F7F7",
  surface_card: "#FFFFFF",
  surface_card_2: "#F7F7F7",
  sidebar: "#F7F7F7",
  surface_raised: "#EBEBEB",
  surface_input: "#FFFFFF",
  surface_muted: "#EAEAEA",
  foreground: "#131314",
  foreground_strong: "#1E1C1D",
  foreground_muted: "#5F5E5A",
  foreground_disabled: "#A0A0A0",
  primary: "#7C3AED",
  primary_foreground: "#FFFFFF",
  primary_glow: "#8B5CF6",
  border: "rgba(0,0,0,0.1)",
  border_strong: "rgba(0,0,0,0.15)",
};

/* ── Hex → CSS passthrough ────────────────────────────────── */

function hexToOklchCss(hex: string): string {
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) return hex;
  return hex;
}

/* ── Apply colors to DOM ──────────────────────────────────── */

function applyColors(colors: ThemeColors, mode: ThemeMode) {
  const root = document.documentElement;
  root.style.colorScheme = mode;

  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  const map: [keyof ThemeColors, string][] = [
    ["background", "--background"],
    ["surface", "--surface"],
    ["surface_card", "--surface-card"],
    ["surface_card_2", "--surface-card-2"],
    ["sidebar", "--sidebar"],
    ["surface_raised", "--surface-raised"],
    ["surface_input", "--surface-input"],
    ["surface_muted", "--surface-muted"],
    ["foreground", "--foreground"],
    ["foreground_strong", "--foreground-strong"],
    ["foreground_muted", "--foreground-muted"],
    ["foreground_disabled", "--foreground-disabled"],
    ["primary", "--primary"],
    ["primary_foreground", "--primary-foreground"],
    ["primary_glow", "--primary-glow"],
    ["border", "--border"],
    ["border_strong", "--border-strong"],
  ];

  for (const [key, cssVar] of map) {
    const value = colors[key];
    if (value) {
      root.style.setProperty(cssVar, hexToOklchCss(value));
    } else {
      root.style.removeProperty(cssVar);
    }
  }

  // Derived tokens that depend on primary
  if (colors.primary) {
    const p = hexToOklchCss(colors.primary);
    root.style.setProperty("--primary-soft", `${p}1a`);
    root.style.setProperty("--border-active", p);
    root.style.setProperty("--ring", p);
    root.style.setProperty("--status-review", p);

    // Chat bubble — in dark mode, primary is a light accent color;
    // mix with black to produce a rich, saturated bubble background.
    if (mode === "dark") {
      root.style.setProperty("--chat-bubble", `color-mix(in oklch, ${p} 45%, black)`);
      root.style.setProperty("--chat-bubble-foreground", "#FFFFFF");
      root.style.setProperty("--chat-bubble-muted", `color-mix(in oklch, ${p} 20%, transparent)`);
    } else {
      root.style.setProperty("--chat-bubble", p);
      root.style.setProperty(
        "--chat-bubble-foreground",
        hexToOklchCss(colors.primary_foreground ?? "#FFFFFF"),
      );
      root.style.setProperty("--chat-bubble-muted", `color-mix(in oklch, ${p} 15%, transparent)`);
    }
  }
}

/* ── Provider ─────────────────────────────────────────────── */

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { tenantId, isAuthenticated } = useAuth();
  const [brandColors, setBrandColors] = useState<BrandColors>({});
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>({});
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [isLoading, setIsLoading] = useState(true);

  // Load branding from Supabase
  useEffect(() => {
    if (!tenantId || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        const { data } = await supabase
          .from("tenants")
          .select("brand_colors, settings, logo_url")
          .eq("id", tenantId)
          .maybeSingle();

        if (data) {
          const bc = (data.brand_colors as BrandColors) ?? {};
          setBrandColors(bc);

          const s = (data.settings as Record<string, unknown>) ?? {};
          setBrandingSettings({
            theme_mode: (s.theme_mode as ThemeMode) ?? "dark",
            app_name: (s.app_name as string) ?? "ClipsApp",
            logo_url: (s.logo_url as string) ?? data.logo_url ?? undefined,
          });

          const savedMode = (s.theme_mode as ThemeMode) ?? "dark";
          setModeState(savedMode);
        }
      } catch (err) {
        console.error("[BrandingContext] Failed to load branding:", err);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [tenantId, isAuthenticated]);

  // Apply colors whenever mode or brandColors change
  const activeColors = useMemo(() => {
    const defaults = mode === "dark" ? DEFAULT_DARK : DEFAULT_LIGHT;
    const overrides = mode === "dark" ? brandColors.dark : brandColors.light;
    return { ...defaults, ...overrides };
  }, [mode, brandColors]);

  useEffect(() => {
    applyColors(activeColors, mode);
  }, [activeColors, mode]);

  // Toggle
  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
  }, []);

  // Single logo URL — used everywhere
  const logoUrl = brandingSettings.logo_url ?? null;

  const appName = brandingSettings.app_name ?? "ClipsApp";

  // Save branding to Supabase
  const saveBranding = useCallback(
    async (newBrandColors: BrandColors, newSettings: Partial<BrandingSettings>) => {
      if (!tenantId) return { error: "No tenant" };

      try {
        const { data: current } = await supabase
          .from("tenants")
          .select("settings")
          .eq("id", tenantId)
          .maybeSingle();

        const existingSettings = (current?.settings as Record<string, unknown>) ?? {};
        const mergedSettings = { ...existingSettings, ...newSettings };

        const { error } = await supabase
          .from("tenants")
          .update({
            brand_colors: newBrandColors as unknown as Json,
            settings: mergedSettings as unknown as Json,
          })
          .eq("id", tenantId);

        if (error) return { error: error.message };

        setBrandColors(newBrandColors);
        setBrandingSettings((prev) => ({ ...prev, ...newSettings }));

        return { error: null };
      } catch (err) {
        return { error: String(err) };
      }
    },
    [tenantId],
  );

  const value = useMemo<BrandingState>(
    () => ({
      mode,
      toggleMode,
      setMode,
      colors: activeColors,
      brandColors,
      brandingSettings,
      logoUrl,
      appName,
      isLoading,
      saveBranding,
    }),
    [
      mode,
      toggleMode,
      setMode,
      activeColors,
      brandColors,
      brandingSettings,
      logoUrl,
      appName,
      isLoading,
      saveBranding,
    ],
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding(): BrandingState {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error("useBranding() must be called inside <BrandingProvider>");
  return ctx;
}
