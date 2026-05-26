/**
 * MemoryPanel — side sheet to edit the persistent context Clips keeps about you.
 *
 * Backed by `ai_user_memory` (one row per user/tenant). Whatever you save
 * here gets injected into every Ask Clips system prompt.
 */
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Memory {
  display_name: string;
  brand_voice: string;
  priorities: string;
  custom_notes: string;
}

const EMPTY: Memory = { display_name: "", brand_voice: "", priorities: "", custom_notes: "" };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemoryPanel({ open, onOpenChange }: Props) {
  const { user, tenantId } = useAuth();
  const [mem, setMem] = useState<Memory>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("ai_user_memory")
        .select("display_name, brand_voice, priorities, custom_notes")
        .eq("user_id", user.id)
        .maybeSingle();
      setMem({
        display_name: data?.display_name || "",
        brand_voice: data?.brand_voice || "",
        priorities: data?.priorities || "",
        custom_notes: data?.custom_notes || "",
      });
      setLoading(false);
    })();
  }, [open, user]);

  const save = async () => {
    if (!user || !tenantId) return;
    setSaving(true);
    const { error } = await supabase
      .from("ai_user_memory")
      .upsert({ user_id: user.id, tenant_id: tenantId, ...mem }, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast.error("Could not save");
    else {
      toast.success("Memory updated");
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>What Clips remembers</SheetTitle>
          <SheetDescription>
            Persistent context attached to every conversation. Keep it focused.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-foreground-muted" />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="name">How to address you</Label>
              <Input
                id="name"
                value={mem.display_name}
                onChange={(e) => setMem({ ...mem, display_name: e.target.value })}
                placeholder="e.g. Alex"
              />
            </div>
            <div>
              <Label htmlFor="voice">Brand / agency voice</Label>
              <Textarea
                id="voice"
                rows={3}
                value={mem.brand_voice}
                onChange={(e) => setMem({ ...mem, brand_voice: e.target.value })}
                placeholder="e.g. Punchy, no-fluff, founder-led."
              />
            </div>
            <div>
              <Label htmlFor="prio">Current priorities</Label>
              <Textarea
                id="prio"
                rows={3}
                value={mem.priorities}
                onChange={(e) => setMem({ ...mem, priorities: e.target.value })}
                placeholder="e.g. Q2 focus on retention, onboard 3 new enterprise clients."
              />
            </div>
            <div>
              <Label htmlFor="notes">Anything else</Label>
              <Textarea
                id="notes"
                rows={4}
                value={mem.custom_notes}
                onChange={(e) => setMem({ ...mem, custom_notes: e.target.value })}
                placeholder="Free-form notes Clips should always know."
              />
            </div>
            <Button onClick={save} disabled={saving} className="w-full">
              {saving ? <Loader2 className="mr-2 animate-spin" size={16} /> : null} Save
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
