/**
 * RecordPaymentDialog — Manual payment recording (bank transfer, cash, etc.)
 * Inserts to finance_transactions via the stripe-actions Edge Function or updates them directly.
 */
import { useState, useEffect } from "react";
import { format } from "date-fns";
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
import { useClients } from "@/hooks/data";
import { useRecordPayment } from "@/hooks/use-stripe-actions";
import { useUpdateFinanceTransaction } from "@/hooks/use-finance";
import { toast } from "sonner";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedClientId?: string;
  editTransaction?: {
    id: string;
    client_id: string;
    amount: number;
    currency: string;
    category?: string;
    payment_method?: string;
    payment_date?: string;
    notes?: string;
  } | null;
}

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "wire", label: "Wire Transfer" },
  { value: "other", label: "Other" },
];

const CATEGORIES = [
  { value: "service_fee", label: "Service Fee" },
  { value: "retainer", label: "Retainer" },
  { value: "project_fee", label: "Project Fee" },
  { value: "setup_fee", label: "Setup Fee" },
  { value: "bonus", label: "Bonus" },
  { value: "other", label: "Other" },
];

export function RecordPaymentDialog({
  open,
  onOpenChange,
  preselectedClientId,
  editTransaction,
}: RecordPaymentDialogProps) {
  const { data: clients = [] } = useClients();
  const recordPayment = useRecordPayment();
  const updateTransaction = useUpdateFinanceTransaction();

  const [clientId, setClientId] = useState(preselectedClientId ?? "");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [category, setCategory] = useState("service_fee");
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");

  const reset = () => {
    setClientId(preselectedClientId ?? "");
    setAmount("");
    setPaymentMethod("bank_transfer");
    setCategory("service_fee");
    setPaymentDate(format(new Date(), "yyyy-MM-dd"));
    setNotes("");
  };

  useEffect(() => {
    if (open) {
      if (editTransaction) {
        setClientId(editTransaction.client_id || "");
        setAmount(String(editTransaction.amount) || "");
        setPaymentMethod(editTransaction.payment_method || "bank_transfer");
        setCategory(editTransaction.category || "service_fee");
        setPaymentDate(
          editTransaction.payment_date
            ? editTransaction.payment_date.split("T")[0]
            : format(new Date(), "yyyy-MM-dd"),
        );
        setNotes(editTransaction.notes || "");
      } else {
        reset();
      }
    }
  }, [open, editTransaction]);

  const handleSubmit = () => {
    if (!clientId || !amount) {
      toast.error("Client and amount are required");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    const isPending = recordPayment.isPending || updateTransaction.isPending;
    if (isPending) return;

    if (editTransaction) {
      updateTransaction.mutate(
        {
          id: editTransaction.id,
          client_id: clientId,
          amount: numAmount,
          currency: editTransaction.currency || "AED",
          category,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          notes: notes || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Payment details updated successfully");
            onOpenChange(false);
          },
          onError: (err) => {
            toast.error(`Failed to update: ${err.message}`);
          },
        },
      );
    } else {
      recordPayment.mutate(
        {
          client_id: clientId,
          amount: numAmount,
          currency: "AED",
          transaction_type: "income",
          category,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          notes: notes || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Payment recorded successfully");
            reset();
            onOpenChange(false);
          },
          onError: (err) => {
            toast.error(`Failed to record: ${err.message}`);
          },
        },
      );
    }
  };

  const isSaving = recordPayment.isPending || updateTransaction.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editTransaction ? "Edit Payment Details" : "Record Payment"}</DialogTitle>
          <DialogDescription>
            {editTransaction
              ? "Update manual payment transaction details."
              : "Log a manual payment (bank transfer, cash, cheque)."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Client */}
          <div className="space-y-1.5">
            <Label htmlFor="rp-client">Client</Label>
            <Select value={clientId} onValueChange={setClientId} disabled={!!editTransaction}>
              <SelectTrigger id="rp-client">
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

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="rp-amount">Amount (AED)</Label>
            <Input
              id="rp-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="5,000.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Two columns: method + category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="rp-date">Payment Date</Label>
            <Input
              id="rp-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="rp-notes">Notes (optional)</Label>
            <Textarea
              id="rp-notes"
              placeholder="Invoice #, reference, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || !clientId || !amount}>
            {isSaving ? "Saving…" : editTransaction ? "Save Changes" : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
