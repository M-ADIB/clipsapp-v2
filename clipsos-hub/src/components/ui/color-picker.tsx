/**
 * ColorPickerPopover — premium color picker with visual selector + multi-format input.
 *
 * Features:
 * - Visual saturation/brightness gradient area
 * - Hue slider bar
 * - Format tabs: HEX, RGB, HSL
 * - Live swatch preview
 * - Click the swatch to open, click outside to close
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/* ── Color conversion helpers ────────────────────────────── */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6 && clean.length !== 3) return null;
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  if (isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return rgbToHex(Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255));
}

/** Try to parse any CSS color string into a hex value */
function parseToHex(value: string): string | null {
  const trimmed = value.trim();

  // Already hex
  if (/^#[0-9a-f]{3,8}$/i.test(trimmed)) {
    const clean = trimmed.replace("#", "");
    if (clean.length === 3)
      return (
        "#" +
        clean
          .split("")
          .map((c) => c + c)
          .join("")
      );
    if (clean.length === 6) return "#" + clean;
    return null;
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/);
  if (rgbMatch) {
    return rgbToHex(+rgbMatch[1], +rgbMatch[2], +rgbMatch[3]);
  }

  // hsl(h, s%, l%) or hsla(h, s%, l%, a)
  const hslMatch = trimmed.match(/hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/);
  if (hslMatch) {
    return hslToHex(+hslMatch[1], +hslMatch[2], +hslMatch[3]);
  }

  return null;
}

type ColorFormat = "hex" | "rgb" | "hsl";

/* ── Inline number input ──────────────────────────────────── */

function NumInput({
  value,
  onChange,
  label,
  max = 255,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  max?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(0, +e.target.value || 0)))}
        className="h-7 w-full rounded-md border border-border bg-surface-raised px-1.5 text-center text-[11px] text-foreground-strong outline-none focus:border-primary"
      />
      <span className="text-[9px] uppercase text-foreground-disabled">{label}</span>
    </div>
  );
}

/* ── Main ColorPickerPopover ─────────────────────────────── */

interface ColorPickerPopoverProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ColorPickerPopover({ value, onChange, label }: ColorPickerPopoverProps) {
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [hexValue, setHexValue] = useState("#000000");
  const [rawInput, setRawInput] = useState(value);
  const isRgbaValue =
    value.startsWith("rgba") || value.startsWith("rgb(") || value.startsWith("hsl");

  // Sync external value into local hex state
  useEffect(() => {
    const parsed = parseToHex(value);
    if (parsed) setHexValue(parsed.toLowerCase());
    setRawInput(value);
  }, [value]);

  const rgb = hexToRgb(hexValue) ?? { r: 0, g: 0, b: 0 };
  const hsl = hexToHsl(hexValue) ?? { h: 0, s: 0, l: 0 };

  const handlePickerChange = useCallback(
    (hex: string) => {
      setHexValue(hex);
      setRawInput(hex);
      onChange(hex);
    },
    [onChange],
  );

  const handleHexInput = useCallback(
    (input: string) => {
      setRawInput(input);
      if (/^#[0-9a-f]{6}$/i.test(input)) {
        setHexValue(input.toLowerCase());
        onChange(input.toLowerCase());
      }
    },
    [onChange],
  );

  const handleRgbChange = useCallback(
    (r: number, g: number, b: number) => {
      const hex = rgbToHex(r, g, b);
      setHexValue(hex);
      setRawInput(hex);
      onChange(hex);
    },
    [onChange],
  );

  const handleHslChange = useCallback(
    (h: number, s: number, l: number) => {
      const hex = hslToHex(h, s, l);
      setHexValue(hex);
      setRawInput(hex);
      onChange(hex);
    },
    [onChange],
  );

  const handleRawBlur = useCallback(() => {
    const parsed = parseToHex(rawInput);
    if (parsed) {
      setHexValue(parsed.toLowerCase());
      onChange(parsed.toLowerCase());
    } else {
      // If it's a valid CSS value (like rgba), pass through directly
      if (
        rawInput.startsWith("rgba") ||
        rawInput.startsWith("rgb(") ||
        rawInput.startsWith("hsl")
      ) {
        onChange(rawInput);
      }
    }
  }, [rawInput, onChange]);

  const formats: ColorFormat[] = ["hex", "rgb", "hsl"];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-border-strong shadow-inner transition-transform hover:scale-105 active:scale-95"
          style={{ background: value }}
          aria-label={`Pick color for ${label ?? "swatch"}`}
        />
      </PopoverTrigger>

      <PopoverContent
        side="right"
        sideOffset={8}
        align="start"
        className="w-[260px] rounded-xl border border-border bg-surface-card p-0 shadow-2xl"
      >
        {/* ── Visual picker ─────────────────────────────────── */}
        <div className="p-3 pb-2">
          <div className="overflow-hidden rounded-lg [&_.react-colorful]:!w-full [&_.react-colorful]:!h-[160px] [&_.react-colorful__saturation]:!rounded-lg [&_.react-colorful__hue]:!rounded [&_.react-colorful__hue]:!h-[10px] [&_.react-colorful__hue]:!mt-2 [&_.react-colorful__pointer]:!w-4 [&_.react-colorful__pointer]:!h-4">
            <HexColorPicker color={hexValue} onChange={handlePickerChange} />
          </div>
        </div>

        {/* ── Format tabs ───────────────────────────────────── */}
        <div className="mx-3 flex rounded-lg bg-surface-raised p-0.5">
          {formats.map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`flex-1 rounded-md py-1 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                format === f
                  ? "bg-surface-input text-foreground-strong shadow-sm"
                  : "text-foreground-disabled hover:text-foreground-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Value inputs ──────────────────────────────────── */}
        <div className="px-3 pb-3 pt-2">
          {format === "hex" && (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <input
                  value={rawInput}
                  onChange={(e) => handleHexInput(e.target.value)}
                  onBlur={handleRawBlur}
                  placeholder="#000000"
                  className="h-7 w-full rounded-md border border-border bg-surface-raised px-2 font-mono text-[11px] uppercase text-foreground-strong outline-none focus:border-primary"
                />
                <p className="mt-0.5 text-[9px] uppercase text-foreground-disabled">
                  Hex / rgb() / hsl()
                </p>
              </div>
              <div
                className="mb-3 h-7 w-7 shrink-0 rounded-md border border-border-strong"
                style={{ background: hexValue }}
              />
            </div>
          )}

          {format === "rgb" && (
            <div className="grid grid-cols-3 gap-2">
              <NumInput
                label="R"
                value={rgb.r}
                max={255}
                onChange={(r) => handleRgbChange(r, rgb.g, rgb.b)}
              />
              <NumInput
                label="G"
                value={rgb.g}
                max={255}
                onChange={(g) => handleRgbChange(rgb.r, g, rgb.b)}
              />
              <NumInput
                label="B"
                value={rgb.b}
                max={255}
                onChange={(b) => handleRgbChange(rgb.r, rgb.g, b)}
              />
            </div>
          )}

          {format === "hsl" && (
            <div className="grid grid-cols-3 gap-2">
              <NumInput
                label="H"
                value={hsl.h}
                max={360}
                onChange={(h) => handleHslChange(h, hsl.s, hsl.l)}
              />
              <NumInput
                label="S"
                value={hsl.s}
                max={100}
                onChange={(s) => handleHslChange(hsl.h, s, hsl.l)}
              />
              <NumInput
                label="L"
                value={hsl.l}
                max={100}
                onChange={(l) => handleHslChange(hsl.h, hsl.s, l)}
              />
            </div>
          )}
        </div>

        {/* ── Quick copy ─────────────────────────────────────── */}
        <div className="border-t border-border px-3 py-2">
          <p className="text-center text-[9px] text-foreground-disabled">
            {hexValue.toUpperCase()} · rgb({rgb.r}, {rgb.g}, {rgb.b}) · hsl({hsl.h}, {hsl.s}%,{" "}
            {hsl.l}%)
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
