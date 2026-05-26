/**
 * EditDealDialog — Edit an existing CRM deal.
 * Uses useUpdateCrmDeal mutation.
 */
import { useEffect, useState } from "react";
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

const STAGES = ["Pre-Booking Seat", "Payment Pending", "Closed/Paid", "Ghosted", "No Stage"];

const REGIONS = ["UAE", "KSA", "USA", "UK", "EU", "Other"];

export function EditDealDialog({ open, onOpenChange, deal }: EditDealDialogProps) {
  const updateDeal = useUpdateCrmDeal();

  const [name, setName] = useState("");
  const [plan, setPlan] = useState("");
  const [stage, setStage] = useState("No Stage");
  const [region, setRegion] = useState("UAE");
  const [totalVideos, setTotalVideos] = useState("");
  const [notes, setNotes] = useState("");

  // Populate form when deal changes
  useEffect(() => {
    if (deal) {
      setName(deal.name ?? "");
      setPlan(deal.plan ?? "");
      setStage(deal.stage ?? "No Stage");
      setRegion(deal.region ?? "UAE");
      setTotalVideos(deal.totalVideos ? String(deal.totalVideos) : "");
      setNotes(deal.notes ?? "");
    }
  }, [deal]);

  const handleSubmit = () => {
    if (!deal) return;
    if (!name.trim()) {
      toast.error("Deal name is required");
      return;
    }

    updateDeal.mutate(
      {
        id: deal.id,
        name: name.trim(),
        plan: plan || null,
        stage,
        region,
        total_videos: totalVideos ? parseInt(totalVideos, 10) : null,
        notes: notes || null,
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

        <div className="space-y-4 py-2">
          {/* Deal Name */}
          <div className="space-y-1.5">
            <Label htmlFor="ed-name">Deal Name</Label>
            <Input id="ed-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Plan + Stage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ed-plan">Plan</Label>
              <Input id="ed-plan" value={plan} onChange={(e) => setPlan(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={stage} onValueChange={setStage}>
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
            </div>
          </div>

          {/* Region + Videos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Region</Label>
              <Select value={region} onValueChange={setRegion}>
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
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ed-videos">Video Count</Label>
              <Input
                id="ed-videos"
                type="number"
                min="0"
                value={totalVideos}
                onChange={(e) => setTotalVideos(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="ed-notes">Notes</Label>
            <Textarea
              id="ed-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateDeal.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateDeal.isPending || !name.trim()}>
            {updateDeal.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
