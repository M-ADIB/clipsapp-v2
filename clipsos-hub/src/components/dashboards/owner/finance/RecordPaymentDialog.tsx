/**
 * RecordPaymentDialog — Manual payment recording (bank transfer, cash, etc.)
 * Inserts to finance_transactions via the stripe-actions Edge Function or updates them directly.
 */
import { useEffect } from "react";
import { format } from "date-fns";
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
import { useClients } from "@/hooks/data";
import { useRecordPayment } from "@/hooks/use-stripe-actions";
import { useUpdateFinanceTransaction } from "@/hooks/use-finance";
import { toast } from "sonner";

import {
  PAYMENT_CATEGORIES,
  PAYMENT_METHODS,
  recordPaymentSchema,
  type RecordPaymentValues,
} from "@/lib/forms/finance-schemas";

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

export function RecordPaymentDialog({
  open,
  onOpenChange,
  preselectedClientId,
  editTransaction,
}: RecordPaymentDialogProps) {
  const { data: clients = [] } = useClients();
  const recordPayment = useRecordPayment();
  const updateTransaction = useUpdateFinanceTransaction();

  const defaults = (): RecordPaymentValues => ({
    clientId: preselectedClientId ?? "",
    amount: "",
    paymentMethod: "bank_transfer",
    category: "service_fee",
    paymentDate: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RecordPaymentValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    if (!open) return;
    if (editTransaction) {
      reset({
        clientId: editTransaction.client_id || "",
        amount: String(editTransaction.amount) || "",
        paymentMethod: editTransaction.payment_method || "bank_transfer",
        category: editTransaction.category || "service_fee",
        paymentDate: editTransaction.payment_date
          ? editTransaction.payment_date.split("T")[0]
          : format(new Date(), "yyyy-MM-dd"),
        notes: editTransaction.notes || "",
      });
    } else {
      reset(defaults());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editTransaction]);

  const isSaving = recordPayment.isPending || updateTransaction.isPending;

  const onSubmit = (values: RecordPaymentValues) => {
    if (isSaving) return;
    const numAmount = parseFloat(values.amount);

    if (editTransaction) {
      updateTransaction.mutate(
        {
          id: editTransaction.id,
          client_id: values.clientId,
          amount: numAmount,
          currency: editTransaction.currency || "AED",
          category: values.category,
          payment_date: values.paymentDate,
          payment_method: values.paymentMethod,
          notes: values.notes || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Payment details updated successfully");
            onOpenChange(false);
          },
          onError: (err) => toast.error(`Failed to update: ${err.message}`),
        },
      );
    } else {
      recordPayment.mutate(
        {
          client_id: values.clientId,
          amount: numAmount,
          currency: "AED",
          transaction_type: "income",
          category: values.category,
          payment_date: values.paymentDate,
          payment_method: values.paymentMethod,
          notes: values.notes || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Payment recorded successfully");
            reset(defaults());
            onOpenChange(false);
          },
          onError: (err) => toast.error(`Failed to record: ${err.message}`),
        },
      );
    }
  };

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

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-2">
            {/* Client */}
            <div className="space-y-1.5">
              <Label htmlFor="rp-client">Client</Label>
              <Controller
                control={control}
                name="clientId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!!editTransaction}
                  >
                    <SelectTrigger id="rp-client" aria-invalid={!!errors.clientId}>
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

            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="rp-amount">Amount (AED)</Label>
              <Input
                id="rp-amount"
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

            {/* Two columns: method + category */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <Controller
                  control={control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="rp-date">Payment Date</Label>
              <Input id="rp-date" type="date" {...register("paymentDate")} />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="rp-notes">Notes (optional)</Label>
              <Textarea
                id="rp-notes"
                placeholder="Invoice #, reference, etc."
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
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : editTransaction ? "Save Changes" : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
