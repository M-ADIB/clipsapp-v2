/**
 * AddColumnDialog / EditColumnDialog — single component for both flows.
 *
 * Writes directly to `custom_columns` (and updates on edit). All 16 cell
 * types are selectable; option-bearing types reveal an options editor.
 */
import { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { AppRole } from "@/integrations/supabase/db-types";

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
  const { tenantId } = useAuth();
  const isEdit = !!columnId;

  const [name, setName] = useState("");
  const [type, setType] = useState<CellType>("text");
  const [options, setOptions] = useState<string[]>([""]);
  const [width, setWidth] = useState(150);
  const [editableRoles, setEditableRoles] = useState<AppRole[]>([
    "owner",
    "manager",
    "senior_editor",
    "content_creator",
    "editor",
  ]);
  const [saving, setSaving] = useState(false);

  const showOptions = type === "single_select" || type === "multi_select";

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      setName("");
      setType("text");
      setOptions([""]);
      setWidth(150);
      return;
    }
    void (async () => {
      const { data, error } = await supabase
        .from("custom_columns")
        .select("*")
        .eq("id", columnId!)
        .single();
      if (error || !data) return;
      setName(data.column_name);
      setType((data.column_type as CellType) ?? "text");
      setOptions(Array.isArray(data.options) ? (data.options as string[]) : [""]);
      setWidth(data.width_px ?? 150);
      setEditableRoles((data.editable_roles as AppRole[]) ?? []);
    })();
  }, [open, isEdit, columnId]);

  const toggleRole = (r: AppRole) => {
    setEditableRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  const onSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!tenantId) return;

    setSaving(true);
    try {
      const payload = {
        tenant_id: tenantId,
        project_id: projectId ?? null,
        column_name: name.trim(),
        column_type: type,
        options: showOptions ? options.filter((o) => o.trim()) : null,
        width_px: width,
        editable_roles: editableRoles,
        show_in_table: true,
      };

      if (isEdit) {
        const { error } = await supabase.from("custom_columns").update(payload).eq("id", columnId!);
        if (error) throw error;
        toast.success("Field updated");
      } else {
        const { data: existing } = await supabase
          .from("custom_columns")
          .select("order_index")
          .eq("tenant_id", tenantId)
          .order("order_index", { ascending: false })
          .limit(1);
        const next = (existing?.[0]?.order_index ?? 0) + 1;
        const { error } = await supabase
          .from("custom_columns")
          .insert({ ...payload, order_index: next });
        if (error) throw error;
        toast.success("Field added");
      }

      onSaved();
      onOpenChange(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit field" : "Add field"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Field name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hook Score"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Field type</Label>
            <Select value={type} onValueChange={(v) => setType(v as CellType)}>
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
          </div>

          {showOptions && (
            <div>
              <Label>Options</Label>
              <div className="mt-1 space-y-2">
                {options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={o}
                      onChange={(e) => {
                        const next = [...options];
                        next[i] = e.target.value;
                        setOptions(next);
                      }}
                      placeholder={`Option ${i + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOptions([...options, ""])}
                  className="w-full"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add option
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label>Width (px)</Label>
            <Input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min={60}
              max={600}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Who can edit this field?</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((r) => (
                <div
                  key={r}
                  className="flex items-center justify-between rounded-md border border-white/10 px-2 py-1.5"
                >
                  <span className="text-xs capitalize">{r.replace("_", " ")}</span>
                  <Switch
                    checked={editableRoles.includes(r)}
                    onCheckedChange={() => toggleRole(r)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add field"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
