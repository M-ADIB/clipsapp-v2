/**
 * EditDealDialog — Edit an existing CRM deal.
 * Uses useUpdateCrmDeal mutation.
 */
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCrmDeal } from "@/hooks/data";
import { toast } from "sonner";

import { dealSchema, REGIONS, STAGES, type DealFormValues } from "@/lib/forms/deal-schemas";

interface DealData {
  id: string;
  name: string;
  plan: string;
  stage: string;
  personName: string;
  region: string;
  totalVideos: number;
  notes?: string;
}

interface EditDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: DealData | null;
}

export function EditDealDialog({ open, onOpenChange, deal }: EditDealDialogProps) {
  const updateDeal = useUpdateCrmDeal();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      name: "",
      personId: "",
      plan: "",
      stage: "No Stage",
      region: "UAE",
      totalVideos: "",
      notes: "",
    },
  });

  // Populate the form when the deal changes.
  useEffect(() => {
    if (deal) {
      reset({
        name: deal.name ?? "",
        personId: "",
        plan: deal.plan ?? "",
        stage: deal.stage ?? "No Stage",
        region: deal.region ?? "UAE",
        totalVideos: deal.totalVideos ? String(deal.totalVideos) : "",
        notes: deal.notes ?? "",
      });
    }
  }, [deal, reset]);

  const onSubmit = (values: DealFormValues) => {
    if (!deal) return;
    updateDeal.mutate(
      {
        id: deal.id,
        name: values.name.trim(),
        plan: values.plan || null,
        stage: values.stage,
        region: values.region,
        total_videos: values.totalVideos ? parseInt(values.totalVideos, 10) : null,
        notes: values.notes || null,
      },
      {
        onSuccess: () => {
          toast.success("Deal updated!");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(`Failed: ${err.message}`);
        },
      },
    );
  };

  if (!deal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
          <DialogDescription>Update deal details — {deal.personName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-2">
            {/* Deal Name */}
            <div className="space-y-1.5">
              <Label htmlFor="ed-name">Deal Name</Label>
              <Input id="ed-name" aria-invalid={!!errors.name} {...register("name")} />
              {errors.name && (
                <p className="text-xs text-status-danger" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Plan + Stage */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ed-plan">Plan</Label>
                <Input id="ed-plan" {...register("plan")} />
              </div>
              <div className="space-y-1.5">
                <Label>Stage</Label>
                <Controller
                  control={control}
                  name="stage"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Region + Videos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Region</Label>
                <Controller
                  control={control}
                  name="region"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ed-videos">Video Count</Label>
                <Input id="ed-videos" type="number" min="0" {...register("totalVideos")} />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="ed-notes">Notes</Label>
              <Textarea id="ed-notes" rows={3} {...register("notes")} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateDeal.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateDeal.isPending}>
              {updateDeal.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
