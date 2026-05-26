/**
 * FormBuilderFieldEditor — Right panel for configuring a selected field.
 *
 * Sections:
 *  1. Field Settings (label, description, placeholder, required, options)
 *  2. Field-specific config (scale, consent, hidden, dropdown)
 *  3. Conditional Logic ("Show this field only when…")
 *  4. Qualifying Logic ("If answer is X, disqualify / route to ending")
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, X, Zap, ShieldAlert, ChevronDown, Trash2 } from "lucide-react";
import type {
  BuilderField,
  ConditionalRule,
  LogicCondition,
  LogicAction,
  LogicOperator,
  FormStep,
  FormEnding,
} from "./form-builder-types";
import { OPTION_BASED_TYPES, LOGIC_ELIGIBLE_TYPES, isLayoutField } from "./form-builder-types";

interface Props {
  field: BuilderField;
  onChange: (updated: BuilderField) => void;
  /** All fields in the form (for conditional logic field picker) */
  allFields: BuilderField[];
  /** Available steps (for skip_to_step targets) */
  steps?: FormStep[];
  /** Available endings (for routing targets) */
  endings?: FormEnding[];
}

const OPERATOR_LABELS: Record<LogicOperator, string> = {
  equals: "Equals",
  not_equals: "Does not equal",
  contains: "Contains",
  not_contains: "Does not contain",
  greater_than: "Greater than",
  less_than: "Less than",
  is_empty: "Is empty",
  is_not_empty: "Is not empty",
};

const ACTION_LABELS: Record<LogicAction, string> = {
  show: "Show this field",
  hide: "Hide this field",
  skip_to_step: "Skip to step",
  disqualify: "Disqualify",
  end: "Route to ending",
};

export function FormBuilderFieldEditor({ field, onChange, allFields, steps, endings }: Props) {
  const hasOptions = OPTION_BASED_TYPES.includes(field.type);
  const isLayout = isLayoutField(field.type);
  const canHaveLogic = !isLayout && field.type !== "hidden";

  // Only fields that appear BEFORE this field can be logic sources
  const precedingFields = allFields.filter(
    (f) =>
      f.id !== field.id &&
      !isLayoutField(f.type) &&
      f.type !== "hidden" &&
      (f.step < field.step || (f.step === field.step && f.position < field.position)),
  );

  function update(patch: Partial<BuilderField>) {
    onChange({ ...field, ...patch });
  }

  function setLogic(rule: ConditionalRule | null) {
    update({ conditional_logic: rule });
  }

  function addCondition() {
    const current = field.conditional_logic ?? {
      action: "show" as LogicAction,
      conditions: [],
      logic_gate: "all" as const,
    };
    setLogic({
      ...current,
      conditions: [
        ...current.conditions,
        {
          field_id: precedingFields[0]?.id ?? "",
          operator: "equals" as LogicOperator,
          value: "",
        },
      ],
    });
  }

  function updateCondition(index: number, patch: Partial<LogicCondition>) {
    if (!field.conditional_logic) return;
    const conditions = [...field.conditional_logic.conditions];
    conditions[index] = { ...conditions[index], ...patch };
    setLogic({ ...field.conditional_logic, conditions });
  }

  function removeCondition(index: number) {
    if (!field.conditional_logic) return;
    const conditions = field.conditional_logic.conditions.filter((_, i) => i !== index);
    if (conditions.length === 0) {
      setLogic(null);
    } else {
      setLogic({ ...field.conditional_logic, conditions });
    }
  }

  return (
    <div className="w-80 shrink-0 border-l border-border bg-surface-card/30">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Field Settings
        </h3>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4 space-y-5">
          {/* ── Label ── */}
          <div className="space-y-1.5">
            <Label className="text-xs">Label</Label>
            <Input
              value={field.label}
              onChange={(e) => update({ label: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          {/* ── Description ── */}
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={field.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={2}
              className="text-sm resize-none"
              placeholder="Help text shown below the field"
            />
          </div>

          {!isLayout && (
            <>
              {/* ── Placeholder ── */}
              {field.type !== "consent" &&
                field.type !== "hidden" &&
                field.type !== "rating" &&
                field.type !== "scale" &&
                field.type !== "yes_no" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      value={field.placeholder}
                      onChange={(e) => update({ placeholder: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                )}

              <Separator />

              {/* ── Required ── */}
              {field.type !== "hidden" && (
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Required</Label>
                  <Switch
                    checked={field.is_required}
                    onCheckedChange={(v) => update({ is_required: v })}
                  />
                </div>
              )}
            </>
          )}

          {/* ── Options (select / multi-select / dropdown) ── */}
          {hasOptions && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs">Options</Label>
                {field.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const next = [...field.options];
                        next[i] = e.target.value;
                        update({ options: next });
                      }}
                      className="h-7 text-xs flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => update({ options: field.options.filter((_, j) => j !== i) })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs h-7"
                  onClick={() =>
                    update({
                      options: [...field.options, `Option ${field.options.length + 1}`],
                    })
                  }
                >
                  <Plus className="h-3 w-3" />
                  Add Option
                </Button>
              </div>
            </>
          )}

          {/* ── Field-Specific Settings ── */}

          {/* Scale */}
          {field.type === "scale" && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-xs font-medium">Scale Settings</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Points</Label>
                    <Select
                      value={String(field.scale_points ?? 10)}
                      onValueChange={(v) => update({ scale_points: parseInt(v) })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 5, 7, 10].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} points
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Min Label</Label>
                  <Input
                    value={field.scale_min_label ?? ""}
                    onChange={(e) => update({ scale_min_label: e.target.value })}
                    className="h-7 text-xs"
                    placeholder="Not at all"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Max Label</Label>
                  <Input
                    value={field.scale_max_label ?? ""}
                    onChange={(e) => update({ scale_max_label: e.target.value })}
                    className="h-7 text-xs"
                    placeholder="Very much"
                  />
                </div>
              </div>
            </>
          )}

          {/* Consent */}
          {field.type === "consent" && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-xs font-medium">Consent Settings</Label>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Agreement Text</Label>
                  <Textarea
                    value={field.consent_text ?? ""}
                    onChange={(e) => update({ consent_text: e.target.value })}
                    rows={2}
                    className="text-xs resize-none"
                    placeholder="I agree to the terms and conditions"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Terms Link URL</Label>
                  <Input
                    value={field.consent_link_url ?? ""}
                    onChange={(e) => update({ consent_link_url: e.target.value })}
                    className="h-7 text-xs"
                    placeholder="https://yoursite.com/terms"
                  />
                </div>
              </div>
            </>
          )}

          {/* Hidden */}
          {field.type === "hidden" && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-xs font-medium">Hidden Field Settings</Label>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Default Value</Label>
                  <Input
                    value={field.hidden_value ?? ""}
                    onChange={(e) => update({ hidden_value: e.target.value })}
                    className="h-7 text-xs"
                    placeholder="utm_source=google"
                  />
                  <p className="text-[9px] text-muted-foreground">
                    Not visible to the user but submitted with the form
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Dropdown */}
          {field.type === "dropdown" && (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Searchable</Label>
                <Switch
                  checked={field.dropdown_searchable ?? false}
                  onCheckedChange={(v) => update({ dropdown_searchable: v })}
                />
              </div>
            </>
          )}

          {/* ── Conditional Logic ── */}
          {canHaveLogic && precedingFields.length > 0 && (
            <>
              <Separator />
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-1 group">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs font-medium">Conditional Logic</span>
                    {field.conditional_logic && (
                      <Badge className="text-[9px] h-4 px-1 bg-blue-500/10 text-blue-400 border-blue-500/20">
                        Active
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-2">
                  {field.conditional_logic ? (
                    <>
                      {/* Action selector */}
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Action</Label>
                        <Select
                          value={field.conditional_logic.action}
                          onValueChange={(v: LogicAction) =>
                            setLogic({ ...field.conditional_logic!, action: v })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="show">Show this field</SelectItem>
                            <SelectItem value="hide">Hide this field</SelectItem>
                            {steps && steps.length > 1 && (
                              <SelectItem value="skip_to_step">Skip to step</SelectItem>
                            )}
                            {endings && endings.length > 0 && (
                              <>
                                <SelectItem value="disqualify">Disqualify</SelectItem>
                                <SelectItem value="end">Route to ending</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Logic gate */}
                      {field.conditional_logic.conditions.length > 1 && (
                        <div className="flex items-center gap-2">
                          <Label className="text-[10px] text-muted-foreground">When</Label>
                          <Select
                            value={field.conditional_logic.logic_gate}
                            onValueChange={(v: "all" | "any") =>
                              setLogic({ ...field.conditional_logic!, logic_gate: v })
                            }
                          >
                            <SelectTrigger className="h-6 text-[10px] w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All (AND)</SelectItem>
                              <SelectItem value="any">Any (OR)</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className="text-[10px] text-muted-foreground">
                            conditions match
                          </span>
                        </div>
                      )}

                      {/* Conditions */}
                      {field.conditional_logic.conditions.map((cond, ci) => (
                        <div
                          key={ci}
                          className="space-y-1.5 p-2 bg-accent/5 rounded-lg border border-border"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium text-muted-foreground">
                              Condition {ci + 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => removeCondition(ci)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          {/* Field picker */}
                          <Select
                            value={cond.field_id}
                            onValueChange={(v) => updateCondition(ci, { field_id: v })}
                          >
                            <SelectTrigger className="h-7 text-[10px]">
                              <SelectValue placeholder="Select field…" />
                            </SelectTrigger>
                            <SelectContent>
                              {precedingFields.map((pf) => (
                                <SelectItem key={pf.id} value={pf.id}>
                                  {pf.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {/* Operator */}
                          <Select
                            value={cond.operator}
                            onValueChange={(v: LogicOperator) =>
                              updateCondition(ci, { operator: v })
                            }
                          >
                            <SelectTrigger className="h-7 text-[10px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(OPERATOR_LABELS).map(([k, l]) => (
                                <SelectItem key={k} value={k}>
                                  {l}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {/* Value */}
                          {!["is_empty", "is_not_empty"].includes(cond.operator) && (
                            <ConditionValueInput
                              condition={cond}
                              sourceField={allFields.find((f) => f.id === cond.field_id)}
                              onChange={(v) => updateCondition(ci, { value: v })}
                            />
                          )}
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 text-[10px] h-7"
                        onClick={addCondition}
                      >
                        <Plus className="h-3 w-3" />
                        Add Condition
                      </Button>

                      {/* Target (for skip_to_step / end / disqualify) */}
                      {(field.conditional_logic.action === "skip_to_step" ||
                        field.conditional_logic.action === "end" ||
                        field.conditional_logic.action === "disqualify") && (
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">
                            {field.conditional_logic.action === "skip_to_step"
                              ? "Target Step"
                              : "Target Ending"}
                          </Label>
                          <Select
                            value={field.conditional_logic.target ?? ""}
                            onValueChange={(v) =>
                              setLogic({ ...field.conditional_logic!, target: v })
                            }
                          >
                            <SelectTrigger className="h-7 text-[10px]">
                              <SelectValue placeholder="Select target…" />
                            </SelectTrigger>
                            <SelectContent>
                              {field.conditional_logic.action === "skip_to_step"
                                ? steps
                                    ?.filter((_, i) => i > field.step)
                                    .map((s) => (
                                      <SelectItem key={s.id} value={s.id}>
                                        {s.title}
                                      </SelectItem>
                                    ))
                                : endings?.map((e) => (
                                    <SelectItem key={e.id} value={e.id}>
                                      {e.title}
                                      {e.is_default ? " (default)" : ""}
                                    </SelectItem>
                                  ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Remove all logic */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-[10px] h-7 text-destructive hover:text-destructive"
                        onClick={() => setLogic(null)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove Logic
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs h-8"
                      onClick={addCondition}
                    >
                      <Plus className="h-3 w-3" />
                      Add Conditional Logic
                    </Button>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ── Condition Value Input ──────────────────────────────────────────────────

function ConditionValueInput({
  condition,
  sourceField,
  onChange,
}: {
  condition: LogicCondition;
  sourceField?: BuilderField;
  onChange: (value: string | number | boolean) => void;
}) {
  // If the source field has discrete options, show a dropdown
  if (sourceField && OPTION_BASED_TYPES.includes(sourceField.type)) {
    return (
      <Select value={String(condition.value)} onValueChange={onChange}>
        <SelectTrigger className="h-7 text-[10px]">
          <SelectValue placeholder="Select value…" />
        </SelectTrigger>
        <SelectContent>
          {sourceField.options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Yes/No
  if (sourceField?.type === "yes_no") {
    return (
      <Select value={String(condition.value)} onValueChange={onChange}>
        <SelectTrigger className="h-7 text-[10px]">
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Yes">Yes</SelectItem>
          <SelectItem value="No">No</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  // Rating / scale / number → number input
  if (
    sourceField?.type === "rating" ||
    sourceField?.type === "scale" ||
    sourceField?.type === "number"
  ) {
    return (
      <Input
        type="number"
        value={String(condition.value ?? "")}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="h-7 text-[10px]"
        placeholder="Value"
      />
    );
  }

  // Default: text input
  return (
    <Input
      value={String(condition.value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 text-[10px]"
      placeholder="Value"
    />
  );
}
