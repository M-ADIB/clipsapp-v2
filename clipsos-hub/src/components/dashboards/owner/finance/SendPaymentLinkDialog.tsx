/**
 * SendPaymentLinkDialog — Create a Stripe Payment Link and copy it.
 * Calls the stripe-actions Edge Function with action=create-payment-link.
 */
import { useState } from "react";
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
import { useClients } from "@/hooks/data";
import { useCreatePaymentLink } from "@/hooks/use-stripe-actions";
import { toast } from "sonner";
import { Copy, ExternalLink, Check } from "lucide-react";

import { paymentLinkSchema, type PaymentLinkValues } from "@/lib/forms/finance-schemas";

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

  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const defaults = (): PaymentLinkValues => ({
    clientId: preselectedClientId ?? "",
    amount: "",
    currency: "aed",
    description: "",
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PaymentLinkValues>({
    resolver: zodResolver(paymentLinkSchema),
    defaultValues: defaults(),
  });

  const resetAll = () => {
    reset(defaults());
    setGeneratedUrl(null);
    setCopied(false);
  };

  const onSubmit = (values: PaymentLinkValues) => {
    const amountCents = Math.round(parseFloat(values.amount) * 100);
    createLink.mutate(
      {
        client_id: values.clientId,
        amount: amountCents,
        currency: values.currency,
        description: values.description || "Payment",
      },
      {
        onSuccess: (result) => {
          setGeneratedUrl(result.payment_link_url);
          toast.success("Payment link created!");
        },
        onError: (err) => toast.error(`Failed: ${err.message}`),
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
        if (!v) resetAll();
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
              <Button variant="outline" onClick={resetAll}>
                Create Another
              </Button>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          /* ── Form state ── */
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4 py-2">
              {/* Client */}
              <div className="space-y-1.5">
                <Label htmlFor="spl-client">Client</Label>
                <Controller
                  control={control}
                  name="clientId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="spl-client" aria-invalid={!!errors.clientId}>
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
                  )}
                />
                {errors.clientId && (
                  <p className="text-xs text-status-danger" role="alert">
                    {errors.clientId.message}
                  </p>
                )}
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
                    aria-invalid={!!errors.amount}
                    {...register("amount")}
                  />
                  {errors.amount && (
                    <p className="text-xs text-status-danger" role="alert">
                      {errors.amount.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Controller
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aed">AED</SelectItem>
                          <SelectItem value="usd">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="spl-desc">Description</Label>
                <Input
                  id="spl-desc"
                  placeholder="Monthly retainer, project fee, etc."
                  {...register("description")}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={createLink.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLink.isPending}>
                  {createLink.isPending ? "Generating…" : "Generate Link"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
