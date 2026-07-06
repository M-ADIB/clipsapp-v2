/**
 * CreateClientDialog — Dialog for creating a new client workspace.
 *
 * Wired to `useCreateClient()` mutation from `use-clients.ts`.
 * Uses shadcn/ui primitives (Dialog, Input, Select, Label, Button).
 *
 * Fields map to the `clients` table schema:
 *  - name (required)
 *  - email
 *  - workspace_type ("individual" | "company")
 *  - account_status ("onboarding" | "active" | "trial")
 *  - industry
 *  - videos_per_month
 *  - description (notes)
 */
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, User, Building2, Mail, Briefcase, Video, FileText } from "lucide-react";
import { toast } from "sonner";

import { useCreateClient } from "@/hooks/data";
import { createClientSchema, type CreateClientValues } from "@/lib/forms/client-schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INITIAL_FORM: CreateClientValues = {
  name: "",
  email: "",
  workspace_type: "individual",
  account_status: "onboarding",
  industry: "",
  videos_per_month: "",
  description: "",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CreateClientDialog({ open, onOpenChange }: CreateClientDialogProps) {
  const createClient = useCreateClient();
  const {
    register,
    handleSubmit,
    control,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<CreateClientValues>({
    resolver: zodResolver(createClientSchema),
    defaultValues: INITIAL_FORM,
  });

  // Auto-focus name field when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => setFocus("name"), 100);
    }
  }, [open, setFocus]);

  const handleClose = (open: boolean) => {
    if (!open) reset(INITIAL_FORM);
    onOpenChange(open);
  };

  const onSubmit = async (values: CreateClientValues) => {
    try {
      await createClient.mutateAsync({
        name: values.name.trim(),
        email: values.email.trim() || null,
        workspace_type: values.workspace_type,
        account_status: values.account_status,
        industry: values.industry.trim() || null,
        videos_per_month: values.videos_per_month ? Number(values.videos_per_month) : null,
        description: values.description.trim() || null,
      } as any);

      toast.success("Client created successfully", {
        description: `${values.name.trim()} workspace is ready.`,
      });
      handleClose(false);
    } catch (err) {
      toast.error("Failed to create client", {
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-border bg-surface-card sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground-strong">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            New Client Workspace
          </DialogTitle>
          <DialogDescription className="text-foreground-muted">
            Create a new client workspace. You can configure details later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2" noValidate>
          {/* ── Row 1: Name + Email ── */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name (required) */}
            <div className="space-y-2">
              <Label
                htmlFor="client-name"
                className="flex items-center gap-1.5 text-xs text-foreground-muted"
              >
                <User className="h-3 w-3" />
                Client Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="client-name"
                placeholder="e.g. Acme Corp"
                aria-invalid={!!errors.name}
                className={`h-10 bg-surface-input text-sm ${errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-[11px] text-red-400" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="client-email"
                className="flex items-center gap-1.5 text-xs text-foreground-muted"
              >
                <Mail className="h-3 w-3" />
                Email
              </Label>
              <Input
                id="client-email"
                type="email"
                placeholder="client@example.com"
                aria-invalid={!!errors.email}
                className={`h-10 bg-surface-input text-sm ${errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[11px] text-red-400" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* ── Row 2: Workspace Type + Status ── */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Workspace Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs text-foreground-muted">
                <Building2 className="h-3 w-3" />
                Workspace Type
              </Label>
              <Controller
                control={control}
                name="workspace_type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 bg-surface-input text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">
                        <span className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-foreground-muted" />
                          Individual
                        </span>
                      </SelectItem>
                      <SelectItem value="company">
                        <span className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-foreground-muted" />
                          Company
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Account Status */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs text-foreground-muted">
                <Briefcase className="h-3 w-3" />
                Account Status
              </Label>
              <Controller
                control={control}
                name="account_status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 bg-surface-input text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* ── Row 3: Industry + Videos/mo ── */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Industry */}
            <div className="space-y-2">
              <Label
                htmlFor="client-industry"
                className="flex items-center gap-1.5 text-xs text-foreground-muted"
              >
                <Briefcase className="h-3 w-3" />
                Industry
              </Label>
              <Input
                id="client-industry"
                placeholder="e.g. Tech, Healthcare"
                className="h-10 bg-surface-input text-sm"
                {...register("industry")}
              />
            </div>

            {/* Videos per month */}
            <div className="space-y-2">
              <Label
                htmlFor="client-videos"
                className="flex items-center gap-1.5 text-xs text-foreground-muted"
              >
                <Video className="h-3 w-3" />
                Videos / month
              </Label>
              <Input
                id="client-videos"
                type="number"
                min={0}
                placeholder="e.g. 8"
                aria-invalid={!!errors.videos_per_month}
                className={`h-10 bg-surface-input text-sm ${errors.videos_per_month ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                {...register("videos_per_month")}
              />
              {errors.videos_per_month && (
                <p className="text-[11px] text-red-400" role="alert">
                  {errors.videos_per_month.message}
                </p>
              )}
            </div>
          </div>

          {/* ── Notes ── */}
          <div className="space-y-2">
            <Label
              htmlFor="client-notes"
              className="flex items-center gap-1.5 text-xs text-foreground-muted"
            >
              <FileText className="h-3 w-3" />
              Notes
            </Label>
            <textarea
              id="client-notes"
              rows={3}
              placeholder="Optional notes about the client…"
              className="w-full rounded-md border border-input bg-surface-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              {...register("description")}
            />
          </div>

          {/* ── Footer ── */}
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              className="border-border text-foreground-muted hover:bg-surface-raised/50"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createClient.isPending} className="min-w-[120px]">
              {createClient.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Client
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
