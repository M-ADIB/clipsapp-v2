import React, { useEffect, useRef, useState } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";

interface InlineFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  type?: "text" | "email" | "tel" | "select" | "date" | "number" | "textarea";
  options?: { value: string; label: string }[];
  placeholder?: string;
  onSave: (val: string) => Promise<void>;
  badge?: React.ReactNode;
}

export function InlineEditableField({
  icon: Icon,
  label,
  value,
  type = "text",
  options = [],
  placeholder = "Not set",
  onSave,
  badge,
}: InlineFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (inputValue === (value ?? "")) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(inputValue);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      handleSave();
    } else if (e.key === "Escape") {
      setInputValue(value ?? "");
      setIsEditing(false);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (
      e.relatedTarget &&
      (e.relatedTarget.id === `${label}-save` || e.relatedTarget.id === `${label}-cancel`)
    ) {
      return;
    }
    handleSave();
  };

  return (
    <div
      className="group flex flex-col gap-2 md:flex-row md:items-center md:justify-between py-3 border-b border-border/40 hover:bg-foreground/[0.01] px-2 rounded-md transition-colors"
      onClick={() => {
        if (!isEditing && !isSaving) setIsEditing(true);
      }}
    >
      {/* Icon + Label */}
      <div className="flex items-center gap-2.5 min-w-[200px] select-none cursor-pointer">
        <Icon className="h-4 w-4 text-foreground-disabled" />
        <span className="text-sm font-medium text-foreground-muted">{label}</span>
      </div>

      {/* Value Editor */}
      <div
        className="flex-grow flex items-center justify-end gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {isEditing ? (
          <div className="flex items-center gap-2 w-full md:max-w-md">
            {type === "textarea" ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={2}
                className="w-full bg-surface-card-2 border border-border rounded px-2.5 py-1 text-sm text-foreground-strong focus:outline-none focus:border-primary resize-none"
              />
            ) : type === "select" ? (
              <select
                ref={inputRef as React.RefObject<HTMLSelectElement>}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
                className="w-full h-8 bg-surface-card-2 border border-border rounded px-2.5 text-sm text-foreground-strong focus:outline-none focus:border-primary"
              >
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type={type}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full h-8 bg-surface-card-2 border border-border rounded px-2.5 text-sm text-foreground-strong focus:outline-none focus:border-primary"
              />
            )}

            <div className="flex items-center gap-1 shrink-0">
              <button
                id={`${label}-save`}
                onClick={handleSave}
                disabled={isSaving}
                className="p-1 rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                id={`${label}-cancel`}
                onClick={() => {
                  setInputValue(value ?? "");
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="p-1 rounded bg-surface border border-border text-foreground-disabled hover:bg-surface-raised cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 cursor-pointer text-sm font-medium">
            {badge ? (
              badge
            ) : value ? (
              <span className="text-foreground-strong font-mono">{value}</span>
            ) : (
              <span className="text-foreground-disabled italic text-xs">{placeholder}</span>
            )}

            <span className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-foreground-disabled hover:text-foreground-muted">
              <Pencil className="h-3.5 w-3.5" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
