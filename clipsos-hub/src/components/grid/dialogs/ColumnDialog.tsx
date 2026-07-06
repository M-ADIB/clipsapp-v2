/**
 * AddColumnDialog / EditColumnDialog — single component for both flows.
 *
 * Writes to `custom_columns` via use-custom-columns hooks (no inline SQL). All
 * cell types are selectable; option-bearing types reveal an options editor.
 */
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppRole } from "@/integrations/supabase/db-types";
import { useCustomColumn, useSaveCustomColumn } from "@/hooks/use-custom-columns";
import { columnSchema, type ColumnFormValues } from "@/lib/forms/column-schemas";

import type { CellType } from "../core/types";

const TYPE_OPTIONS: { value: CellType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "long_text", label: "Long text" },
  { value: "number", label: "Number" },
  { value: "currency", label: "Currency" },
  { value: "date", label: "Date" },
  { value: "single_select", label: "Single select" },
  { value: "multi_select", label: "Multi select" },
  { value: "url", label: "URL" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "yes_no", label: "Yes / No" },
  { value: "rating", label: "Rating" },
  { value: "progress", label: "Progress %" },
  { value: "file", label: "File" },
  { value: "image", label: "Image" },
];

const ROLE_OPTIONS: AppRole[] = [
  "owner",
  "manager",
  "senior_editor",
  "content_creator",
  "editor",
  "moderator",
  "client",
];

const DEFAULT_ROLES: AppRole[] = ["owner", "manager", "senior_editor", "content_creator", "editor"];

const DEFAULTS: ColumnFormValues = {
  name: "",
  type: "text",
  options: [""],
  width: 150,
  editableRoles: DEFAULT_ROLES,
};

interface ColumnDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId?: string;
  /** Pass a column id to edit; omit to add */
  columnId?: string | null;
  onSaved: () => void;
}

export function ColumnDialog({
  open,
  onOpenChange,
  projectId,
  columnId,
  onSaved,
}: ColumnDialogProps) {
  const isEdit = !!columnId;
  const { data: existing } = useCustomColumn(open && isEdit ? columnId : null);
  const saveColumn = useSaveCustomColumn();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ColumnFormValues>({
    resolver: zodResolver(columnSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      reset(DEFAULTS);
      return;
    }
    if (existing) {
      reset({
        name: existing.column_name,
        type: (existing.column_type as CellType) ?? "text",
        options: Array.isArray(existing.options) ? existing.options : [""],
        width: existing.width_px ?? 150,
        editableRoles: existing.editable_roles ?? [],
      });
    }
  }, [open, isEdit, existing, reset]);

  const type = watch("type");
  const showOptions = type === "single_select" || type === "multi_select";

  const onSubmit = async (values: ColumnFormValues) => {
    try {
      await saveColumn.mutateAsync({
        columnId,
        input: {
          column_name: values.name.trim(),
          column_type: values.type,
          options: showOptions ? values.options.filter((o) => o.trim()) : null,
          width_px: values.width,
          editable_roles: values.editableRoles as AppRole[],
          project_id: projectId ?? null,
        },
      });
      toast.success(isEdit ? "Field updated" : "Field added");
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit field" : "Add field"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <div>
              <Label htmlFor="col-name">Field name</Label>
              <Input
                id="col-name"
                placeholder="e.g. Hook Score"
                className="mt-1"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-status-danger" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label>Field type</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {showOptions && (
              <div>
                <Label>Options</Label>
                <Controller
                  control={control}
                  name="options"
                  render={({ field }) => (
                    <div className="mt-1 space-y-2">
                      {field.value.map((o, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={o}
                            onChange={(e) => {
                              const next = [...field.value];
                              next[i] = e.target.value;
                              field.onChange(next);
                            }}
                            placeholder={`Option ${i + 1}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              field.onChange(field.value.filter((_, idx) => idx !== i))
                            }
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => field.onChange([...field.value, ""])}
                        className="w-full"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add option
                      </Button>
                    </div>
                  )}
                />
              </div>
            )}

            <div>
              <Label htmlFor="col-width">Width (px)</Label>
              <Input
                id="col-width"
                type="number"
                min={60}
                max={600}
                className="mt-1"
                {...register("width", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label>Who can edit this field?</Label>
              <Controller
                control={control}
                name="editableRoles"
                render={({ field }) => (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {ROLE_OPTIONS.map((r) => (
                      <div
                        key={r}
                        className="flex items-center justify-between rounded-md border border-white/10 px-2 py-1.5"
                      >
                        <span className="text-xs capitalize">{r.replace("_", " ")}</span>
                        <Switch
                          checked={field.value.includes(r)}
                          onCheckedChange={() =>
                            field.onChange(
                              field.value.includes(r)
                                ? field.value.filter((x) => x !== r)
                                : [...field.value, r],
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveColumn.isPending}>
              {saveColumn.isPending ? "Saving..." : isEdit ? "Save changes" : "Add field"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
