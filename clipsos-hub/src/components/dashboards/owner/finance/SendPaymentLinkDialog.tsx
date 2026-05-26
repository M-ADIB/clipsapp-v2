/**
 * SendPaymentLinkDialog — Create a Stripe Payment Link and copy it.
 * Calls the stripe-actions Edge Function with action=create-payment-link.
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
import { useClients } from "@/hooks/data";
import { useCreatePaymentLink } from "@/hooks/use-stripe-actions";
import { toast } from "sonner";
import { Copy, ExternalLink, Check } from "lucide-react";

interface SendPaymentLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedClientId?: string;
}

export function SendPaymentLinkDialog({
  open,
  onOpenChange,
  preselectedClientId,
}: SendPaymentLinkDialogProps) {
  const { data: clients = [] } = useClients();
  const createLink = useCreatePaymentLink();

  const [clientId, setClientId] = useState(preselectedClientId ?? "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("aed");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setClientId(preselectedClientId ?? "");
    setAmount("");
    setDescription("");
    setCurrency("aed");
    setGeneratedUrl(null);
    setCopied(false);
  };

  const handleGenerate = () => {
    if (!clientId || !amount) {
      toast.error("Client and amount are required");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    // Convert AED to cents
    const amountCents = Math.round(numAmount * 100);

    createLink.mutate(
      {
        client_id: clientId,
        amount: amountCents,
        currency,
        description: description || "Payment",
      },
      {
        onSuccess: (result) => {
          setGeneratedUrl(result.payment_link_url);
          toast.success("Payment link created!");
        },
        onError: (err) => {
          toast.error(`Failed: ${err.message}`);
        },
      },
    );
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Payment Link</DialogTitle>
          <DialogDescription>
            Generate a Stripe payment link and share it with your client.
          </DialogDescription>
        </DialogHeader>

        {generatedUrl ? (
          /* ── Success state ── */
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-[color:var(--status-success)]/30 bg-[color:var(--status-success)]/5 p-4">
              <p className="text-sm font-medium text-foreground mb-2">Payment link ready!</p>
              <div className="flex items-center gap-2">
                <Input readOnly value={generatedUrl} className="text-xs font-mono" />
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-[color:var(--status-success)]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button size="icon" variant="outline" asChild>
                  <a href={generatedUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => reset()}>
                Create Another
              </Button>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          /* ── Form state ── */
          <div className="space-y-4 py-2">
            {/* Client */}
            <div className="space-y-1.5">
              <Label htmlFor="spl-client">Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger id="spl-client">
                  <SelectValue placeholder="Select client…" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount + Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="spl-amount">Amount</Label>
                <Input
                  id="spl-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5,000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aed">AED</SelectItem>
                    <SelectItem value="usd">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="spl-desc">Description</Label>
              <Input
                id="spl-desc"
                placeholder="Monthly retainer, project fee, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createLink.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={createLink.isPending || !clientId || !amount}
              >
                {createLink.isPending ? "Generating…" : "Generate Link"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
