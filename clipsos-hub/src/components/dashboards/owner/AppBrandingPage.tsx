/**
 * AppBrandingPage — Owner > Management > App Branding
 *
 * Allows owners to customize:
 * - Dark mode color palette (fully independent from light mode)
 * - Light mode color palette (fully independent from dark mode)
 * - App Name (one text, used everywhere: sidebar, login, etc.)
 * - Logo (optional single image — replaces the text name everywhere)
 *
 * Changes are saved to `tenants.brand_colors` + `tenants.settings`
 * and applied globally via BrandingContext.
 */
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useEffect, useState, type ChangeEvent } from "react";

import {
  Moon,
  Sun,
  Palette,
  Check,
  RotateCcw,
  Eye,
  Type,
  Image as ImageIcon,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Copy,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  useBranding,
  type ThemeColors,
  type BrandColors,
  type ThemeMode,
} from "@/contexts/BrandingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorPickerPopover } from "@/components/ui/color-picker";

/* ── Color swatch definitions ─────────────────────────────── */

interface ColorField {
  key: keyof ThemeColors;
  label: string;
  description: string;
  category: "backgrounds" | "text" | "brand" | "borders";
}

const COLOR_FIELDS: ColorField[] = [
  // Backgrounds
  {
    key: "background",
    label: "Page Background",
    description: "Main page background",
    category: "backgrounds",
  },
  {
    key: "sidebar",
    label: "Sidebar",
    description: "Sidebar navigation background",
    category: "backgrounds",
  },
  { key: "surface", label: "Surface", description: "Section panels", category: "backgrounds" },
  { key: "surface_card", label: "Card", description: "Card backgrounds", category: "backgrounds" },
  {
    key: "surface_card_2",
    label: "Card Alt",
    description: "Alternate card backgrounds",
    category: "backgrounds",
  },
  {
    key: "surface_raised",
    label: "Raised",
    description: "Search bars, user cards",
    category: "backgrounds",
  },
  {
    key: "surface_input",
    label: "Input",
    description: "Active nav items, buttons",
    category: "backgrounds",
  },
  { key: "surface_muted", label: "Muted", description: "Progress tracks", category: "backgrounds" },

  // Text colors
  { key: "foreground", label: "Primary Text", description: "Logos, headings", category: "text" },
  {
    key: "foreground_strong",
    label: "Strong Text",
    description: "Main body text",
    category: "text",
  },
  {
    key: "foreground_muted",
    label: "Muted Text",
    description: "Descriptions, secondary text",
    category: "text",
  },
  {
    key: "foreground_disabled",
    label: "Disabled Text",
    description: "Inactive tabs, placeholders",
    category: "text",
  },

  // Brand colors
  { key: "primary", label: "Primary", description: "Brand accent color", category: "brand" },
  {
    key: "primary_foreground",
    label: "On Primary",
    description: "Text on primary backgrounds",
    category: "brand",
  },
  {
    key: "primary_glow",
    label: "Primary Glow",
    description: "Hover states, gradient end",
    category: "brand",
  },

  // Borders
  { key: "border", label: "Border", description: "Default borders", category: "borders" },
  {
    key: "border_strong",
    label: "Border Strong",
    description: "Emphasized borders",
    category: "borders",
  },
];

const CATEGORY_META: Record<string, { label: string; icon: typeof Palette; description: string }> =
  {
    backgrounds: {
      label: "Backgrounds",
      icon: Palette,
      description: "Page, sidebar, card, and surface colors",
    },
    text: {
      label: "Typography",
      icon: Type,
      description: "Headings, body, muted, and disabled text",
    },
    brand: {
      label: "Brand Accent",
      icon: Sparkles,
      description: "Primary color, hover states, and CTA",
    },
    borders: { label: "Borders", icon: Eye, description: "Dividers and card outlines" },
  };

/* ── Default palettes (must match BrandingContext defaults) ── */

const DEFAULT_DARK_COLORS: ThemeColors = {
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

const DEFAULT_LIGHT_COLORS: ThemeColors = {
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

/* ── Color Swatch Row ─────────────────────────────────────── */

function ColorSwatchRow({
  field,
  value,
  onChange,
}: {
  field: ColorField;
  value: string;
  onChange: (key: keyof ThemeColors, value: string) => void;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Copied!", { description: value, duration: 1500 });
  };

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-border-strong hover:bg-surface-raised/30">
      <ColorPickerPopover
        value={value}
        onChange={(v) => onChange(field.key, v)}
        label={field.label}
      />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground-strong">{field.label}</p>
        <p className="text-[10px] text-foreground-muted">{field.description}</p>
      </div>

      {/* Hex/value display + copy */}
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="hidden font-mono text-[10px] text-foreground-disabled md:inline">
          {value.length > 20 ? value.slice(0, 18) + "…" : value}
        </span>
        <button
          onClick={handleCopy}
          className="rounded p-1 text-foreground-disabled opacity-0 transition-all hover:bg-surface-raised hover:text-foreground-muted group-hover:opacity-100"
          aria-label="Copy color value"
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */

export function AppBrandingPage() {
  const branding = useBranding();

  // --- Local editing state ---
  // IMPORTANT: darkColors and lightColors are stored INDEPENDENTLY.
  // Editing dark mode never touches lightColors and vice-versa.
  const [editingMode, setEditingMode] = useState<ThemeMode>("dark");
  const [darkColors, setDarkColors] = useState<ThemeColors>({});
  const [lightColors, setLightColors] = useState<ThemeColors>({});

  // Identity — single app name + optional logo URL
  const [appName, setAppName] = useState("ClipsApp");
  const [logoUrl, setLogoUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    backgrounds: true,
    text: true,
    brand: true,
    borders: false,
  });

  // Initialize from branding context — only on first load
  useEffect(() => {
    if (!branding.isLoading) {
      // Load saved overrides for each mode independently
      setDarkColors(branding.brandColors.dark ?? {});
      setLightColors(branding.brandColors.light ?? {});
      setAppName(branding.appName);
      setLogoUrl(branding.brandingSettings.logo_url ?? "");
    }
  }, [branding.isLoading, branding.brandColors, branding.appName, branding.brandingSettings]);

  // --- Mode-specific getters (never cross-contaminate) ---
  const currentColors = editingMode === "dark" ? darkColors : lightColors;
  const currentDefaults = editingMode === "dark" ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS;
  const setCurrentColors = editingMode === "dark" ? setDarkColors : setLightColors;

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    // Only updates the CURRENT editing mode's state
    setCurrentColors((prev) => ({ ...prev, [key]: value }));
  };

  const getColor = (key: keyof ThemeColors): string => {
    return currentColors[key] ?? currentDefaults[key] ?? "#000000";
  };

  const handleReset = () => {
    if (editingMode === "dark") {
      setDarkColors({});
    } else {
      setLightColors({});
    }
    toast.success(`${editingMode === "dark" ? "Dark" : "Light"} mode colors reset to defaults`);
  };

  const handleSave = async () => {
    setSaving(true);

    // Build brand_colors — each mode saved independently
    const newBrandColors: BrandColors = {
      dark: Object.keys(darkColors).length > 0 ? { ...darkColors } : undefined,
      light: Object.keys(lightColors).length > 0 ? { ...lightColors } : undefined,
    };

    const { error } = await branding.saveBranding(newBrandColors, {
      app_name: appName,
      logo_url: logoUrl || undefined,
    });
    setSaving(false);

    if (error) {
      toast.error("Failed to save branding", { description: error });
    } else {
      toast.success("Branding saved successfully!");
    }
  };

  const handlePreview = () => {
    branding.setMode(editingMode);
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const categories = ["backgrounds", "text", "brand", "borders"] as const;

  return (
    <FullBleed>
      <div className="px-3 py-5 md:px-5 md:py-6">
        {/* ── Page header ────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-foreground-muted md:text-sm">
            Customize your workspace appearance. Changes apply globally across all dashboards.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview} className="gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* ── Left column: Identity + Color Palette Editor ─── */}
          <div className="space-y-5">
            {/* ── App Identity (Name + Logo) ───────────────────── */}
            <div className="rounded-2xl border border-border bg-surface-card p-5">
              <div className="mb-5 flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: "var(--primary-soft)" }}
                >
                  <Type className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground-strong">App Identity</h3>
                  <p className="text-[10px] text-foreground-muted">
                    One name, one logo — changes everywhere (sidebar, login, etc.)
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* App Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground-muted">App Name</label>
                  <Input
                    value={appName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAppName(e.target.value)}
                    placeholder="ClipsApp"
                    className="max-w-sm"
                  />
                  <p className="text-[10px] text-foreground-disabled">
                    This text appears in the sidebar header and login page when no logo is set.
                  </p>
                </div>

                {/* Logo URL (optional — replaces text everywhere) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground-muted">
                    Logo Image <span className="text-foreground-disabled">(optional)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={logoUrl}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setLogoUrl(e.target.value)}
                      placeholder="https://your-logo.svg"
                      className="flex-1 text-xs"
                    />
                    {logoUrl && (
                      <button
                        onClick={() => setLogoUrl("")}
                        className="rounded-md p-1.5 text-foreground-muted transition-colors hover:bg-surface-raised hover:text-foreground"
                        aria-label="Remove logo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-foreground-disabled">
                    If set, this image replaces the text name everywhere. Use a transparent PNG or
                    SVG that works on both dark and light backgrounds.
                  </p>
                </div>

                {/* Logo preview */}
                {logoUrl && (
                  <div className="flex gap-3">
                    <div className="flex flex-1 items-center justify-center rounded-xl bg-surface-raised p-4">
                      <img
                        src={logoUrl}
                        alt="Logo on dark"
                        className="h-8 max-w-[160px] object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div
                      className="flex flex-1 items-center justify-center rounded-xl border border-border p-4"
                      style={{ background: "#F7F7F7" }}
                    >
                      <img
                        src={logoUrl}
                        alt="Logo on light"
                        className="h-8 max-w-[160px] object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Mode Selector ─────────────────────────────────── */}
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-card p-3">
              <button
                onClick={() => setEditingMode("dark")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-medium transition-all ${
                  editingMode === "dark"
                    ? "bg-surface-input text-foreground-strong shadow-sm"
                    : "text-foreground-muted hover:text-foreground-strong"
                }`}
              >
                <Moon className="h-4 w-4" />
                Dark Mode
              </button>
              <button
                onClick={() => setEditingMode("light")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-medium transition-all ${
                  editingMode === "light"
                    ? "bg-surface-input text-foreground-strong shadow-sm"
                    : "text-foreground-muted hover:text-foreground-strong"
                }`}
              >
                <Sun className="h-4 w-4" />
                Light Mode
              </button>
            </div>

            {/* Editing mode indicator */}
            <p className="text-center text-[10px] text-foreground-disabled">
              {editingMode === "dark" ? "🌙" : "☀️"} Editing{" "}
              <span className="font-semibold text-foreground-muted">
                {editingMode === "dark" ? "Dark" : "Light"}
              </span>{" "}
              mode colors — changes are independent from {editingMode === "dark" ? "light" : "dark"}{" "}
              mode
            </p>

            {/* ── Color Categories ──────────────────────────────── */}
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat];
              const fields = COLOR_FIELDS.filter((f) => f.category === cat);
              const isExpanded = expandedCategories[cat];

              return (
                <div
                  key={cat}
                  className="overflow-hidden rounded-2xl border border-border bg-surface-card"
                >
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-surface-raised/20"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ background: "var(--primary-soft)" }}
                      >
                        <meta.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-foreground-strong">{meta.label}</h3>
                        <p className="text-[10px] text-foreground-muted">{meta.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Mini color swatches preview (collapsed) */}
                      {!isExpanded && (
                        <div className="hidden items-center gap-1 md:flex">
                          {fields.slice(0, 5).map((f) => (
                            <div
                              key={f.key}
                              className="h-5 w-5 rounded border border-border-strong"
                              style={{ background: getColor(f.key) }}
                            />
                          ))}
                          {fields.length > 5 && (
                            <span className="ml-1 text-[10px] text-foreground-disabled">
                              +{fields.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-foreground-muted" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-foreground-muted" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="space-y-1 px-5 pb-4">
                      {fields.map((field) => (
                        <ColorSwatchRow
                          key={field.key}
                          field={field}
                          value={getColor(field.key)}
                          onChange={handleColorChange}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Reset button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 text-foreground-muted"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset {editingMode === "dark" ? "Dark" : "Light"} Mode to Defaults
              </Button>
            </div>
          </div>

          {/* ── Right column: Preview ───────────────────────────── */}
          <div className="space-y-5">
            {/* Live Preview Card */}
            <div className="rounded-2xl border border-border bg-surface-card p-5">
              <h3 className="mb-4 text-sm font-medium text-foreground-strong">Live Preview</h3>

              {/* Mini preview of current palette */}
              <div
                className="overflow-hidden rounded-xl border border-border"
                style={{ background: getColor("background") }}
              >
                <div className="flex">
                  {/* Mini sidebar */}
                  <div className="w-16 space-y-1.5 p-2" style={{ background: getColor("sidebar") }}>
                    <div
                      className="h-3 w-full rounded"
                      style={{ background: getColor("primary") }}
                    />
                    <div
                      className="h-2 w-10 rounded"
                      style={{ background: getColor("foreground_muted"), opacity: 0.4 }}
                    />
                    <div
                      className="h-2 w-8 rounded"
                      style={{ background: getColor("foreground_muted"), opacity: 0.3 }}
                    />
                    <div
                      className="h-2 w-10 rounded"
                      style={{ background: getColor("foreground_muted"), opacity: 0.4 }}
                    />
                  </div>

                  {/* Mini content area */}
                  <div className="flex-1 space-y-2 p-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="h-2.5 w-16 rounded"
                        style={{ background: getColor("foreground_strong") }}
                      />
                      <div
                        className="h-2 w-8 rounded"
                        style={{ background: getColor("primary") }}
                      />
                    </div>

                    {/* Mini stat cards */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="rounded-lg p-2"
                          style={{ background: getColor("surface_card") }}
                        >
                          <div
                            className="mb-1 h-1.5 w-8 rounded"
                            style={{ background: getColor("foreground_muted"), opacity: 0.5 }}
                          />
                          <div
                            className="h-3 w-6 rounded"
                            style={{ background: getColor("foreground_strong") }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Mini table */}
                    <div
                      className="rounded-lg p-2"
                      style={{ background: getColor("surface_card") }}
                    >
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 py-1"
                          style={{
                            borderBottom: i < 2 ? `1px solid ${getColor("border")}` : undefined,
                          }}
                        >
                          <div
                            className="h-1.5 w-12 rounded"
                            style={{
                              background: getColor("foreground_strong"),
                              opacity: 0.6,
                            }}
                          />
                          <div className="flex-1" />
                          <div
                            className="h-1.5 w-8 rounded"
                            style={{ background: getColor("primary"), opacity: 0.7 }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-center text-[10px] text-foreground-muted">
                {editingMode === "dark" ? "🌙" : "☀️"} {editingMode === "dark" ? "Dark" : "Light"}{" "}
                mode preview
              </p>
            </div>

            {/* Active mode indicator */}
            <div className="rounded-2xl border border-border bg-surface-card p-5">
              <h3 className="mb-3 text-sm font-medium text-foreground-strong">Active Theme</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => branding.setMode("dark")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    branding.mode === "dark"
                      ? "bg-foreground text-background"
                      : "border border-border text-foreground-muted hover:border-border-strong"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  Dark
                </button>
                <button
                  onClick={() => branding.setMode("light")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    branding.mode === "light"
                      ? "bg-foreground text-background"
                      : "border border-border text-foreground-muted hover:border-border-strong"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  Light
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-foreground-muted">
                Currently viewing in {branding.mode} mode
              </p>
            </div>
          </div>
        </div>
      </div>
    </FullBleed>
  );
}
