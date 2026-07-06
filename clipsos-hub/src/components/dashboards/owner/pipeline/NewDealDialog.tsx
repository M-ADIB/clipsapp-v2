/**
 * NewDealDialog — Create a new CRM deal.
 * Uses useCreateCrmDeal mutation + useCrmPeople for contact selection.
 */
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
import { useCreateCrmDeal, useCrmPeople } from "@/hooks/data";
import { toast } from "sonner";

import { dealSchema, REGIONS, STAGES, type DealFormValues } from "@/lib/forms/deal-schemas";

interface NewDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-set stage when adding via kanban column "Add deal" button */
  defaultStage?: string;
}

export function NewDealDialog({ open, onOpenChange, defaultStage }: NewDealDialogProps) {
  const { data: people = [] } = useCrmPeople();
  const createDeal = useCreateCrmDeal();

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
      stage: defaultStage ?? "No Stage",
      region: "UAE",
      totalVideos: "",
      notes: "",
    },
  });

  const onSubmit = (values: DealFormValues) => {
    createDeal.mutate(
      {
        name: values.name.trim(),
        person_id: values.personId || null,
        plan: values.plan || null,
        stage: values.stage,
        region: values.region,
        total_videos: values.totalVideos ? parseInt(values.totalVideos, 10) : null,
        notes: values.notes || null,
      },
      {
        onSuccess: () => {
          toast.success("Deal created!");
          reset();
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(`Failed: ${err.message}`);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Deal</DialogTitle>
          <DialogDescription>Add a new deal to your sales pipeline.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-2">
            {/* Deal Name */}
            <div className="space-y-1.5">
              <Label htmlFor="nd-name">Deal Name</Label>
              <Input
                id="nd-name"
                placeholder="e.g. Acme Corp — 12 Videos"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-status-danger" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Contact */}
            <div className="space-y-1.5">
              <Label>Contact</Label>
              <Controller
                control={control}
                name="personId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact…" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="none">— No contact —</SelectItem>
                      {people.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.full_name ?? p.email ?? "Unnamed"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Plan + Stage */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nd-plan">Plan</Label>
                <Input id="nd-plan" placeholder="e.g. Pro 8" {...register("plan")} />
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
                <Label htmlFor="nd-videos">Video Count</Label>
                <Input
                  id="nd-videos"
                  type="number"
                  min="0"
                  placeholder="8"
                  {...register("totalVideos")}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="nd-notes">Notes (optional)</Label>
              <Textarea
                id="nd-notes"
                placeholder="Additional details…"
                rows={2}
                {...register("notes")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createDeal.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createDeal.isPending}>
              {createDeal.isPending ? "Creating…" : "Create Deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
