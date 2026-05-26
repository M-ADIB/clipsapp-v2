/**
 * NewDealDialog — Create a new CRM deal.
 * Uses useCreateCrmDeal mutation + useCrmPeople for contact selection.
 */
import { useState } from "react";
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

interface NewDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-set stage when adding via kanban column "Add deal" button */
  defaultStage?: string;
}

const STAGES = ["Pre-Booking Seat", "Payment Pending", "Closed/Paid", "Ghosted", "No Stage"];

const REGIONS = ["UAE", "KSA", "USA", "UK", "EU", "Other"];

export function NewDealDialog({ open, onOpenChange, defaultStage }: NewDealDialogProps) {
  const { data: people = [] } = useCrmPeople();
  const createDeal = useCreateCrmDeal();

  const [name, setName] = useState("");
  const [personId, setPersonId] = useState("");
  const [plan, setPlan] = useState("");
  const [stage, setStage] = useState(defaultStage ?? "No Stage");
  const [region, setRegion] = useState("UAE");
  const [totalVideos, setTotalVideos] = useState("");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setName("");
    setPersonId("");
    setPlan("");
    setStage(defaultStage ?? "No Stage");
    setRegion("UAE");
    setTotalVideos("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Deal name is required");
      return;
    }

    createDeal.mutate(
      {
        name: name.trim(),
        person_id: personId || null,
        plan: plan || null,
        stage,
        region,
        total_videos: totalVideos ? parseInt(totalVideos, 10) : null,
        notes: notes || null,
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

        <div className="space-y-4 py-2">
          {/* Deal Name */}
          <div className="space-y-1.5">
            <Label htmlFor="nd-name">Deal Name</Label>
            <Input
              id="nd-name"
              placeholder="e.g. Acme Corp — 12 Videos"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Contact */}
          <div className="space-y-1.5">
            <Label>Contact</Label>
            <Select value={personId} onValueChange={setPersonId}>
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
          </div>

          {/* Plan + Stage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nd-plan">Plan</Label>
              <Input
                id="nd-plan"
                placeholder="e.g. Pro 8"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              />
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
              <Label htmlFor="nd-videos">Video Count</Label>
              <Input
                id="nd-videos"
                type="number"
                min="0"
                placeholder="8"
                value={totalVideos}
                onChange={(e) => setTotalVideos(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="nd-notes">Notes (optional)</Label>
            <Textarea
              id="nd-notes"
              placeholder="Additional details…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createDeal.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createDeal.isPending || !name.trim()}>
            {createDeal.isPending ? "Creating…" : "Create Deal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
