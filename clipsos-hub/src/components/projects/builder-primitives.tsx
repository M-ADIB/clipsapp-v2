/**
 * Builder UI Primitives
 *
 * Reusable, small UI components shared across project builder steps.
 */

import type React from "react";
import { Input } from "@/components/ui/input";

// ─── SectionCard ─────────────────────────────────────────────────────────────

export function SectionCard({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-surface-raised/40 p-5 space-y-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70 mb-1">
          {label}
        </p>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── FieldRow ────────────────────────────────────────────────────────────────

export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-foreground-muted">{label}</span>
      {children}
    </div>
  );
}

// ─── TogglePills ─────────────────────────────────────────────────────────────

export function TogglePills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-full border px-4 py-2 text-xs font-medium transition-all ${
            value === opt.value
              ? "border-primary bg-primary/10 text-primary shadow-sm"
              : "border-white/[0.08] text-foreground-muted hover:border-white/20"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── CurrencyInput ───────────────────────────────────────────────────────────

export function CurrencyInput({
  value,
  currency,
  suffix,
  onChange,
}: {
  value: number | null;
  currency: string;
  suffix?: string;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-foreground-muted shrink-0">{currency}</span>
      <Input
        type="number"
        min={0}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
        className="h-9"
      />
      {suffix && <span className="text-xs text-foreground-muted whitespace-nowrap">{suffix}</span>}
    </div>
  );
}

// ─── StatPill ────────────────────────────────────────────────────────────────

export function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-amber-500/[0.08] py-2.5 px-2">
      <span className="text-sm font-bold text-foreground">{value}</span>
      <span className="text-[10px] text-foreground-muted">{label}</span>
    </div>
  );
}

// ─── ReviewRow ───────────────────────────────────────────────────────────────

export function ReviewRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs text-foreground-muted">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
