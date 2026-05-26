/**
 * FormBuilderPage — 3-panel layout: sidebar | canvas | field editor.
 * Used for both /forms/new and /forms/$formId/edit.
 *
 * V2: supports multi-step forms, conditional logic, multiple endings.
 */
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { FullBleed } from "@/components/app-shell/FullBleed";
import {
  ArrowLeft,
  Save,
  Eye,
  Settings2,
  Loader2,
  Video,
  Palette,
  PartyPopper,
  ChevronDown,
  Layers,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import {
  useFormBySlug,
  useFormFields,
  useCreateForm,
  useUpdateForm,
  useSaveFormFields,
} from "@/hooks/data";
import { FormBuilderSidebar } from "./FormBuilderSidebar";
import { FormBuilderCanvas } from "./FormBuilderCanvas";
import { FormBuilderFieldEditor } from "./FormBuilderFieldEditor";
import { FormBuilderStepBar } from "./FormBuilderStepBar";
import { FormBuilderEndingsEditor } from "./FormBuilderEndingsEditor";
import {
  createEmptyField,
  createDefaultStep,
  createDefaultEnding,
  FORM_TYPES,
  type BuilderField,
  type FieldType,
  type FormType,
  type FormStep,
  type FormEnding,
  type StepType,
  type ConditionalRule,
} from "./form-builder-types";
import type { Json } from "@/integrations/supabase/db-types";

function getSettings(settings: Json): Record<string, unknown> {
  if (settings && typeof settings === "object" && !Array.isArray(settings)) {
    return settings as Record<string, unknown>;
  }
  return {};
}

export function FormBuilderPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const rolePrefix = role === "manager" ? "/manager" : "/owner";
  const params = useParams({ strict: false }) as { slug?: string };
  const isEditing = !!params.slug;

  // ── Remote data (fetch by slug; mutations use the resolved UUID) ──
  const { data: existingForm, isLoading: formLoading } = useFormBySlug(params.slug);
  const { data: existingFields, isLoading: fieldsLoading } = useFormFields(existingForm?.id);

  // ── Core state ──
  const [title, setTitle] = useState("Untitled Form");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [formType, setFormType] = useState<FormType>("custom");
  const [createCrmContact, setCreateCrmContact] = useState(true);
  const [fields, setFields] = useState<BuilderField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Landing page
  const [accentColor, setAccentColor] = useState("#7C3AED");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  // VSL (for single-page "custom" forms)
  const [vslEnabled, setVslEnabled] = useState(false);
  const [vslUrl, setVslUrl] = useState("");
  const [vslHeadline, setVslHeadline] = useState("");

  // Multi-step
  const [steps, setSteps] = useState<FormStep[]>([createDefaultStep(0)]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Endings
  const [endings, setEndings] = useState<FormEnding[]>([createDefaultEnding(true)]);

  const [initialized, setInitialized] = useState(!isEditing);
  const isMultiStep = formType === "multi_step" || formType === "vsl_funnel";

  // ── Header config: replace UUID breadcrumb with human-readable title ──
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  useEffect(() => {
    const displayTitle = isEditing ? (title !== "Untitled Form" ? title : "Edit Form") : "New Form";
    setHeaderConfig({ title: displayTitle });
    return () => clearHeaderConfig();
  }, [title, isEditing, setHeaderConfig, clearHeaderConfig]);

  // ── Hydrate from DB ──
  useEffect(() => {
    if (isEditing && existingForm && existingFields && !initialized) {
      setTitle(existingForm.title);
      setDescription(existingForm.description ?? "");
      setSlug(existingForm.slug);
      setIsPublished(existingForm.is_published);
      setFormType((existingForm.form_type as FormType) || "custom");

      const s = getSettings(existingForm.settings);
      setCreateCrmContact(s.create_crm_contact !== false);
      if (s.accent_color) setAccentColor(s.accent_color as string);
      if (s.cover_image_url) setCoverImageUrl(s.cover_image_url as string);
      if (s.vsl_enabled) setVslEnabled(s.vsl_enabled as boolean);
      if (s.vsl_url) setVslUrl(s.vsl_url as string);
      if (s.vsl_headline) setVslHeadline(s.vsl_headline as string);

      // Hydrate steps
      if (Array.isArray(s.steps) && (s.steps as FormStep[]).length > 0) {
        setSteps(s.steps as FormStep[]);
      }
      // Hydrate endings
      if (Array.isArray(s.endings) && (s.endings as FormEnding[]).length > 0) {
        setEndings(s.endings as FormEnding[]);
      } else if (s.thank_you_title || s.thank_you_message) {
        // Migrate legacy single ending
        setEndings([
          {
            id: crypto.randomUUID(),
            title: (s.thank_you_title as string) || "Thank you!",
            message: (s.thank_you_message as string) || "Your response has been recorded.",
            redirect_url: (s.redirect_url as string) || undefined,
            is_default: true,
          },
        ]);
      }

      setFields(
        existingFields.map((f, i) => ({
          id: f.id,
          type: f.field_type as FieldType,
          label: f.label,
          description: f.help_text ?? "",
          placeholder: f.placeholder ?? "",
          is_required: f.is_required,
          options: Array.isArray(f.options) ? (f.options as string[]) : [],
          validation_rules: (f.validation as Record<string, unknown>) ?? {},
          position: f.sort_order ?? i,
          // f.step is number | null from DB (NOT NULL DEFAULT 0, but guard anyway)
          step: typeof f.step === "number" ? f.step : 0,
          conditional_logic: (f.conditional_logic as ConditionalRule | null) ?? null,
        })),
      );
      setInitialized(true);
    }
  }, [isEditing, existingForm, existingFields, initialized]);

  // Auto-generate slug — only for NEW forms (never overwrite an existing form's slug)
  useEffect(() => {
    if (!isEditing) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      );
    }
  }, [title, isEditing]);

  // When switching form type, ensure steps are properly initialized
  useEffect(() => {
    if (formType === "vsl_funnel" && steps.length < 2) {
      // VSL funnel: video step first, then fields step
      setSteps([{ ...createDefaultStep(0, "video"), title: "Watch This" }, createDefaultStep(1)]);
      setActiveStepIndex(0);
    } else if (formType === "multi_step" && steps.length < 1) {
      // Multi-step: initialize with one fields step if empty
      setSteps([createDefaultStep(0, "fields")]);
      setActiveStepIndex(0);
    }
    // Reset to first step when changing type
    if (formType !== "custom") {
      setActiveStepIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formType]);

  // ── Mutations ──
  const createForm = useCreateForm();
  const updateForm = useUpdateForm();
  const saveFields = useSaveFormFields();
  const isSaving = createForm.isPending || updateForm.isPending || saveFields.isPending;

  // ── Field operations ──
  const handleAddField = useCallback(
    (type: FieldType) => {
      const step = isMultiStep ? activeStepIndex : 0;
      const newField = createEmptyField(type, fields.length, step);
      setFields((prev) => [...prev, newField]);
      setSelectedFieldId(newField.id);
    },
    [fields.length, isMultiStep, activeStepIndex],
  );

  const handleReorder = useCallback((from: number, to: number) => {
    setFields((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((f, i) => ({ ...f, position: i }));
    });
  }, []);

  const handleRemoveField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSelectedFieldId((prev) => (prev === id ? null : prev));
  }, []);

  const handleUpdateField = useCallback((updated: BuilderField) => {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  }, []);

  // ── Step operations ──
  function handleAddStep(type: StepType) {
    const newStep = createDefaultStep(steps.length, type);
    setSteps((prev) => [...prev, newStep]);
    setActiveStepIndex(steps.length);
  }

  function handleRemoveStep(index: number) {
    if (steps.length <= 1) return;
    setFields((prev) =>
      prev
        .filter((f) => f.step !== index)
        .map((f) => (f.step > index ? { ...f, step: f.step - 1 } : f)),
    );
    setSteps((prev) => prev.filter((_, i) => i !== index));
    setActiveStepIndex((prev) => Math.min(prev, steps.length - 2));
  }

  function handleUpdateStep(index: number, patch: Partial<FormStep>) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function handleReorderStep(from: number, to: number) {
    setSteps((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    // Update field step indices
    setFields((prev) =>
      prev.map((f) => {
        if (f.step === from) return { ...f, step: to };
        if (from < to && f.step > from && f.step <= to) return { ...f, step: f.step - 1 };
        if (from > to && f.step >= to && f.step < from) return { ...f, step: f.step + 1 };
        return f;
      }),
    );
    setActiveStepIndex(to);
  }

  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? null;
  const activeStepDef = isMultiStep ? steps[activeStepIndex] : undefined;

  // ── Save ──
  async function handleSave() {
    if (!title.trim()) {
      toast.error("Form title is required");
      return;
    }
    if (!slug.trim()) {
      toast.error("Form slug is required");
      return;
    }

    try {
      let formId = existingForm?.id; // UUID resolved from slug
      let savedSlug = slug;
      const formPayload = {
        title,
        description: description || null,
        slug,
        is_published: isPublished,
        form_type: formType,
        settings: {
          create_crm_contact: createCrmContact,
          accent_color: accentColor,
          cover_image_url: coverImageUrl || undefined,
          // Legacy VSL (for custom single-page)
          vsl_enabled: vslEnabled,
          vsl_url: vslUrl || undefined,
          vsl_headline: vslHeadline || undefined,
          // Multi-step
          steps: isMultiStep ? steps : undefined,
          // Endings
          endings,
        } as unknown as Json,
      };

      if (isEditing && formId) {
        const updated = await updateForm.mutateAsync({ id: formId, ...formPayload });
        savedSlug = updated.slug;
      } else {
        const created = await createForm.mutateAsync(formPayload);
        formId = created.id;
        savedSlug = created.slug;
      }

      await saveFields.mutateAsync({
        formId: formId!,
        fields: fields.map((f) => ({
          id: f.id,
          field_type: f.type,
          label: f.label,
          help_text: f.description || null,
          placeholder: f.placeholder || null,
          is_required: f.is_required,
          options: (f.options.length > 0 ? f.options : []) as Json,
          validation: (Object.keys(f.validation_rules).length > 0
            ? f.validation_rules
            : {}) as Json,
          sort_order: f.position,
          step: f.step,
          conditional_logic: (f.conditional_logic ?? null) as Json,
        })),
      });

      toast.success(isEditing ? "Form updated" : "Form created");
      if (!isEditing) {
        // Redirect to slug-based URL (not UUID)
        window.location.href = `${rolePrefix}/forms/${savedSlug}/edit`;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save form: ${message}`);
      console.error("[FormBuilder] Save error:", err);
    }
  }

  // ── Loading ──
  if (isEditing && (formLoading || fieldsLoading)) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] rounded-xl" />
      </div>
    );
  }

  return (
    <FullBleed>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <a href={`${rolePrefix}/forms`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </a>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-sm font-medium border-none bg-transparent px-1 focus-visible:ring-1 w-64"
              placeholder="Form title"
            />
            {/* Form type badge */}
            <Select value={formType} onValueChange={(v: FormType) => setFormType(v)}>
              <SelectTrigger className="h-7 w-auto gap-1.5 text-xs border-dashed">
                <Layers className="h-3 w-3" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORM_TYPES.map((ft) => (
                  <SelectItem key={ft.value} value={ft.value}>
                    <div className="flex flex-col">
                      <span>{ft.label}</span>
                      <span className="text-[10px] text-muted-foreground">{ft.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <Label className="text-xs text-muted-foreground">Published</Label>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>

            {/* Settings sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <Settings2 className="h-3.5 w-3.5" />
                  Settings
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Form Settings</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-6 pb-8">
                  {/* Slug */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Slug</Label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">/f/</span>
                      <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="h-8 text-sm flex-1"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Form Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what this form is for…"
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  {/* CRM toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs">Create CRM Contact</Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Automatically add submitters to your CRM
                      </p>
                    </div>
                    <Switch checked={createCrmContact} onCheckedChange={setCreateCrmContact} />
                  </div>

                  <div className="border-t border-border" />

                  {/* Landing Page Appearance */}
                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-1 group">
                      <div className="flex items-center gap-2">
                        <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium">Landing Page</span>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Accent Color</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="h-8 w-8 rounded border border-border cursor-pointer"
                          />
                          <Input
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="h-8 text-sm flex-1 font-mono"
                            placeholder="#7C3AED"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Cover Image URL</Label>
                        <Input
                          value={coverImageUrl}
                          onChange={(e) => setCoverImageUrl(e.target.value)}
                          className="h-8 text-sm"
                          placeholder="https://example.com/cover.jpg"
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="border-t border-border" />

                  {/* VSL (only for single-page forms) */}
                  {formType === "custom" && (
                    <>
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between w-full py-1 group">
                          <div className="flex items-center gap-2">
                            <Video className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium">VSL Video</span>
                          </div>
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-xs">Enable VSL</Label>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                Show a video above the form fields
                              </p>
                            </div>
                            <Switch checked={vslEnabled} onCheckedChange={setVslEnabled} />
                          </div>
                          {vslEnabled && (
                            <>
                              <div className="space-y-1.5">
                                <Label className="text-xs">Video URL</Label>
                                <Input
                                  value={vslUrl}
                                  onChange={(e) => setVslUrl(e.target.value)}
                                  className="h-8 text-sm"
                                  placeholder="https://vimeo.com/… or https://youtube.com/…"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs">Video Headline</Label>
                                <Input
                                  value={vslHeadline}
                                  onChange={(e) => setVslHeadline(e.target.value)}
                                  className="h-8 text-sm"
                                  placeholder="Watch this before filling out the form"
                                />
                              </div>
                            </>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                      <div className="border-t border-border" />
                    </>
                  )}

                  {/* Endings */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-1 group">
                      <div className="flex items-center gap-2">
                        <Target className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium">Endings</span>
                        <Badge variant="secondary" className="text-[9px] h-4 px-1">
                          {endings.length}
                        </Badge>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <FormBuilderEndingsEditor endings={endings} onChange={setEndings} />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </SheetContent>
            </Sheet>

            {isPublished && (
              <Button variant="outline" size="sm" className="h-8 gap-1.5" asChild>
                <a href={`/f/${slug}`} target="_blank" rel="noreferrer">
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </a>
              </Button>
            )}

            <Button size="sm" className="h-8 gap-1.5" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save
            </Button>
          </div>
        </div>

        {/* Step bar (multi-step only) */}
        {isMultiStep && (
          <FormBuilderStepBar
            steps={steps}
            fields={fields}
            activeStepIndex={activeStepIndex}
            onSelectStep={setActiveStepIndex}
            onAddStep={handleAddStep}
            onRemoveStep={handleRemoveStep}
            onUpdateStep={handleUpdateStep}
            onReorderStep={handleReorderStep}
          />
        )}

        {/* 3-panel layout */}
        <div className="flex flex-1 overflow-hidden">
          <FormBuilderSidebar onAddField={handleAddField} isMultiStep={isMultiStep} />
          <FormBuilderCanvas
            fields={fields}
            selectedId={selectedFieldId}
            onSelect={setSelectedFieldId}
            onReorder={handleReorder}
            onRemove={handleRemoveField}
            activeStep={isMultiStep ? activeStepIndex : undefined}
            activeStepDef={activeStepDef}
            onUpdateStepDef={(patch) => handleUpdateStep(activeStepIndex, patch)}
          />
          {selectedField && (
            <FormBuilderFieldEditor
              field={selectedField}
              onChange={handleUpdateField}
              allFields={fields}
              steps={isMultiStep ? steps : undefined}
              endings={endings}
            />
          )}
        </div>
      </div>
    </FullBleed>
  );
}
