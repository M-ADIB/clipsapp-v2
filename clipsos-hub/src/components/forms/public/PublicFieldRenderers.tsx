/**
 * PublicFieldRenderers — renders all field types in the public form.
 * Extracted from PublicFormPage for modularity.
 */
import { useState, useMemo } from "react";
import { AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { COUNTRIES } from "./logic-engine";
import type { Json } from "@/integrations/supabase/db-types";

// ── Types ────────────────────────────────────────────────────────────────────

export interface PublicFieldData {
  id: string;
  field_type: string;
  label: string;
  help_text: string | null;
  placeholder: string | null;
  is_required: boolean;
  options: Json;
  validation: Json;
}

interface FieldProps {
  field: PublicFieldData;
  value: unknown;
  error?: string;
  onChange: (val: unknown) => void;
  accentColor: string;
}

// ── Main Renderer ────────────────────────────────────────────────────────────

export function FieldRenderer({ field, value, error, onChange, accentColor }: FieldProps) {
  const opts = Array.isArray(field.options) ? (field.options as string[]) : [];
  const validation =
    field.validation && typeof field.validation === "object" && !Array.isArray(field.validation)
      ? (field.validation as Record<string, unknown>)
      : {};

  // Layout fields — no input
  if (field.field_type === "heading") {
    return (
      <div className="pt-4 pb-1">
        <h2 className="text-lg font-semibold text-zinc-100">{field.label}</h2>
        <div
          className="h-0.5 w-8 rounded-full mt-2"
          style={{ backgroundColor: `${accentColor}40` }}
        />
      </div>
    );
  }
  if (field.field_type === "paragraph") {
    return (
      <p className="text-sm text-zinc-400 leading-relaxed">{field.help_text || field.label}</p>
    );
  }
  if (field.field_type === "hidden") return null;

  const inputClasses = `bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:border-transparent ${
    error ? "border-red-500/50 focus-visible:ring-red-500/30" : ""
  }`;
  const ringStyle = !error
    ? ({ "--tw-ring-color": `${accentColor}40` } as React.CSSProperties)
    : undefined;

  return (
    <div className="space-y-2 group">
      <Label className="text-sm text-zinc-300 font-medium">
        {field.label}
        {field.is_required && (
          <span className="ml-1" style={{ color: accentColor }}>
            *
          </span>
        )}
      </Label>
      {field.help_text && <p className="text-xs text-zinc-500">{field.help_text}</p>}

      {/* ── Text inputs ── */}
      {["short_text", "email", "phone", "url", "number"].includes(field.field_type) && (
        <Input
          type={
            field.field_type === "email"
              ? "email"
              : field.field_type === "number"
                ? "number"
                : field.field_type === "url"
                  ? "url"
                  : field.field_type === "phone"
                    ? "tel"
                    : "text"
          }
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? ""}
          className={`h-11 ${inputClasses}`}
          style={ringStyle}
        />
      )}

      {/* ── Long text ── */}
      {field.field_type === "long_text" && (
        <Textarea
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? ""}
          rows={4}
          className={inputClasses}
          style={ringStyle}
        />
      )}

      {/* ── Date ── */}
      {field.field_type === "date" && (
        <Input
          type="date"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={`h-11 ${inputClasses}`}
          style={ringStyle}
        />
      )}

      {/* ── Single select (radio) ── */}
      {field.field_type === "single_select" && (
        <RadioGroup value={String(value ?? "")} onValueChange={onChange}>
          <div className="space-y-2">
            {opts.map((opt) => (
              <label
                key={opt}
                htmlFor={`${field.id}-${opt}`}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  value === opt
                    ? "border-transparent bg-zinc-800/80"
                    : "border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50"
                }`}
                style={value === opt ? { borderColor: `${accentColor}40` } : undefined}
              >
                <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                <span className="text-sm text-zinc-300">{opt}</span>
              </label>
            ))}
          </div>
        </RadioGroup>
      )}

      {/* ── Multi select (checkbox) ── */}
      {field.field_type === "multi_select" && (
        <div className="space-y-2">
          {opts.map((opt) => {
            const selected = Array.isArray(value) ? (value as string[]) : [];
            const checked = selected.includes(opt);
            return (
              <label
                key={opt}
                htmlFor={`${field.id}-${opt}`}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  checked
                    ? "border-transparent bg-zinc-800/80"
                    : "border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50"
                }`}
                style={checked ? { borderColor: `${accentColor}40` } : undefined}
              >
                <Checkbox
                  id={`${field.id}-${opt}`}
                  checked={checked}
                  onCheckedChange={(c) =>
                    onChange(c ? [...selected, opt] : selected.filter((s) => s !== opt))
                  }
                />
                <span className="text-sm text-zinc-300">{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* ── Dropdown ── */}
      {field.field_type === "dropdown" && (
        <Select value={String(value ?? "")} onValueChange={onChange}>
          <SelectTrigger className={`h-11 ${inputClasses}`} style={ringStyle}>
            <SelectValue placeholder={field.placeholder || "Select an option…"} />
          </SelectTrigger>
          <SelectContent>
            {opts.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* ── Country ── */}
      {field.field_type === "country" && (
        <CountrySelect
          value={String(value ?? "")}
          onChange={onChange}
          accentColor={accentColor}
          error={!!error}
        />
      )}

      {/* ── Yes/No ── */}
      {field.field_type === "yes_no" && (
        <div className="flex gap-3">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              type="button"
              className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all duration-200 ${
                value === opt
                  ? "text-white border-transparent"
                  : "text-zinc-400 border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50"
              }`}
              style={
                value === opt
                  ? { backgroundColor: accentColor, boxShadow: `0 2px 8px ${accentColor}30` }
                  : undefined
              }
              onClick={() => onChange(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* ── Rating ── */}
      {field.field_type === "rating" && (
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`text-2xl transition-all duration-200 hover:scale-110 ${
                Number(value) >= n ? "drop-shadow-sm" : "text-zinc-700 hover:text-zinc-500"
              }`}
              style={Number(value) >= n ? { color: "#facc15" } : undefined}
            >
              ★
            </button>
          ))}
        </div>
      )}

      {/* ── Scale (Linear) ── */}
      {field.field_type === "scale" && (
        <ScaleRenderer
          field={field}
          value={value}
          onChange={onChange}
          accentColor={accentColor}
          points={Number(validation.scale_points) || 10}
          minLabel={String(validation.scale_min_label || "Low")}
          maxLabel={String(validation.scale_max_label || "High")}
        />
      )}

      {/* ── Consent ── */}
      {field.field_type === "consent" && (
        <ConsentRenderer
          field={field}
          value={value}
          onChange={onChange}
          accentColor={accentColor}
          consentText={String(validation.consent_text || field.label)}
          consentLinkUrl={validation.consent_link_url as string | undefined}
        />
      )}

      {/* ── File upload placeholder ── */}
      {field.field_type === "file_upload" && (
        <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center bg-zinc-900/20">
          <p className="text-xs text-zinc-500">File upload coming soon</p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Sub-Renderers ────────────────────────────────────────────────────────────

function CountrySelect({
  value,
  onChange,
  accentColor,
  error,
}: {
  value: string;
  onChange: (v: unknown) => void;
  accentColor: string;
  error: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [search]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={`h-11 bg-zinc-900/50 border-zinc-800 text-zinc-100 rounded-lg ${error ? "border-red-500/50" : ""}`}
      >
        <SelectValue placeholder="Select a country…" />
      </SelectTrigger>
      <SelectContent className="max-h-[280px]">
        <div className="px-2 pb-2 sticky top-0 bg-popover z-10">
          <Input
            placeholder="Search countries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {filtered.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No countries found</p>
        )}
      </SelectContent>
    </Select>
  );
}

function ScaleRenderer({
  field,
  value,
  onChange,
  accentColor,
  points,
  minLabel,
  maxLabel,
}: {
  field: PublicFieldData;
  value: unknown;
  onChange: (v: unknown) => void;
  accentColor: string;
  points: number;
  minLabel: string;
  maxLabel: string;
}) {
  const nums = Array.from({ length: points }, (_, i) => i + 1);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {nums.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-10 w-10 rounded-lg text-sm font-medium border transition-all duration-200 ${
              value === n
                ? "text-white border-transparent"
                : "text-zinc-400 border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50"
            }`}
            style={value === n ? { backgroundColor: accentColor } : undefined}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-zinc-500 px-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function ConsentRenderer({
  field,
  value,
  onChange,
  accentColor,
  consentText,
  consentLinkUrl,
}: {
  field: PublicFieldData;
  value: unknown;
  onChange: (v: unknown) => void;
  accentColor: string;
  consentText: string;
  consentLinkUrl?: string;
}) {
  const checked = value === true || value === "true";
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 cursor-pointer hover:bg-zinc-900/50 transition-all duration-200">
      <Checkbox checked={checked} onCheckedChange={(c) => onChange(!!c)} className="mt-0.5" />
      <span className="text-sm text-zinc-300 leading-relaxed">
        {consentText}
        {consentLinkUrl && (
          <>
            {" "}
            <a
              href={consentLinkUrl}
              target="_blank"
              rel="noreferrer"
              className="underline hover:opacity-80 transition-opacity"
              style={{ color: accentColor }}
              onClick={(e) => e.stopPropagation()}
            >
              Read more
            </a>
          </>
        )}
      </span>
    </label>
  );
}
