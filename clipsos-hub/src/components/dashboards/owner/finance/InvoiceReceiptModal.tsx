import { format } from "date-fns";
import {
  Printer,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  Calendar,
  DollarSign,
  CreditCard,
  Landmark,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fmtCents, fmtAmount, usdHintCents, usdHint, safeParseDate } from "./finance-helpers";

interface InvoiceReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: {
    id: string;
    date: string;
    clientName: string;
    clientEmail?: string;
    amount: number;
    currency: string;
    provider: "Stripe" | "Manual";
    status: string;
    isCents: boolean;
    category?: string;
    paymentMethod?: string;
    notes?: string;
    fee?: number; // optional stripe fee
  } | null;
}

const PAYMENT_METHODS_MAP: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  cheque: "Cheque",
  wire: "Wire Transfer",
  card: "Credit/Debit Card",
  other: "Other Method",
};

const CATEGORIES_MAP: Record<string, string> = {
  service_fee: "Service Fee",
  retainer: "Retainer",
  project_fee: "Project Fee",
  setup_fee: "Setup Fee",
  bonus: "Bonus",
  other: "Other Service",
};

export function InvoiceReceiptModal({ open, onOpenChange, payment }: InvoiceReceiptModalProps) {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  // Calculations
  const grossAed = payment.isCents ? payment.amount / 100 : payment.amount;
  const feeAed =
    payment.provider === "Stripe"
      ? payment.fee
        ? payment.fee / 100
        : grossAed * 0.029 + 1.1 // stripe standard default if not provided
      : 0;
  const netAed = grossAed - feeAed;

  const paymentMethodLabel = payment.paymentMethod
    ? PAYMENT_METHODS_MAP[payment.paymentMethod] || payment.paymentMethod
    : payment.provider === "Stripe"
      ? "Credit/Debit Card (via Stripe)"
      : "Manual Payment";

  const categoryLabel = payment.category
    ? CATEGORIES_MAP[payment.category] || payment.category
    : "Client Payment";

  const formattedDate = (() => {
    if (!payment.date) return "N/A";
    const d = safeParseDate(payment.date);
    return d ? format(d, "MMMM d, yyyy · hh:mm a") : "N/A";
  })();

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "succeeded":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-amber-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-surface-card border border-border">
        {/* Style tag to control printing */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #print-receipt-content, #print-receipt-content * {
              visibility: visible;
            }
            #print-receipt-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `,
          }}
        />

        <div className="flex flex-col">
          {/* Header Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-muted/50 no-print">
            <h3 className="font-display text-sm font-semibold text-foreground-strong">
              Payment Receipt
            </h3>
            <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 gap-1.5">
              <Printer className="h-3.5 w-3.5" />
              Print Receipt
            </Button>
          </div>

          {/* Receipt Printable Area */}
          <div id="print-receipt-content" className="p-6 space-y-6 bg-surface-card text-foreground">
            {/* Branding & Status */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-display font-semibold tracking-tight text-foreground-strong">
                  ClipsOS Hub
                </h2>
                <p className="text-xs text-foreground-muted">Official Payment Receipt</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted/40 px-3 py-1.5">
                {getStatusIcon(payment.status)}
                <span className="text-xs font-semibold capitalize text-foreground-strong">
                  {payment.status}
                </span>
              </div>
            </div>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 bg-surface-muted/10">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-foreground-disabled block">
                  Receipt ID
                </span>
                <span className="text-xs font-mono font-medium text-foreground-strong break-all select-all">
                  {payment.id}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-foreground-disabled block">
                  Payment Date
                </span>
                <span className="text-xs font-medium text-foreground-strong">{formattedDate}</span>
              </div>
            </div>

            {/* Bill To & Details */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-medium uppercase tracking-wider text-foreground-disabled">
                Transaction Details
              </h4>
              <div className="space-y-2 text-sm border-t border-border pt-2">
                {/* Client Row */}
                <div className="flex justify-between py-1">
                  <span className="text-foreground-muted flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-foreground-disabled" />
                    Client
                  </span>
                  <div className="text-right">
                    <span className="font-medium text-foreground-strong">{payment.clientName}</span>
                    {payment.clientEmail && (
                      <span className="block text-xs text-foreground-muted">
                        {payment.clientEmail}
                      </span>
                    )}
                  </div>
                </div>

                {/* Category Row */}
                <div className="flex justify-between py-1">
                  <span className="text-foreground-muted flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-foreground-disabled" />
                    Category
                  </span>
                  <span className="font-medium text-foreground-strong">{categoryLabel}</span>
                </div>

                {/* Method Row */}
                <div className="flex justify-between py-1">
                  <span className="text-foreground-muted flex items-center gap-1.5">
                    {payment.provider === "Stripe" ? (
                      <CreditCard className="h-3.5 w-3.5 text-foreground-disabled" />
                    ) : (
                      <Landmark className="h-3.5 w-3.5 text-foreground-disabled" />
                    )}
                    Payment Method
                  </span>
                  <span className="font-medium text-foreground-strong">{paymentMethodLabel}</span>
                </div>
              </div>
            </div>

            {/* Finance Breakdown Table */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-medium uppercase tracking-wider text-foreground-disabled">
                Breakdown
              </h4>
              <div className="border-t border-border pt-2 space-y-2 text-sm">
                {/* Gross */}
                <div className="flex justify-between py-1">
                  <span className="text-foreground-muted">Gross Amount</span>
                  <span className="font-mono font-medium text-foreground-strong">
                    {fmtAmount(grossAed, payment.currency)}
                  </span>
                </div>

                {/* Fees (Stripe only) */}
                {payment.provider === "Stripe" && (
                  <div className="flex justify-between py-1 text-red-400">
                    <span>Stripe Fees (approx)</span>
                    <span className="font-mono font-medium">
                      - {fmtAmount(feeAed, payment.currency)}
                    </span>
                  </div>
                )}

                {/* Net */}
                <div className="flex justify-between border-t border-dashed border-border pt-2 font-semibold">
                  <span className="text-foreground-strong">Net Revenue</span>
                  <div className="text-right">
                    <span className="font-mono text-foreground-strong">
                      {fmtAmount(netAed, payment.currency)}
                    </span>
                    <span className="block text-[10px] text-foreground-disabled font-normal">
                      ≈ $
                      {(
                        (payment.isCents ? payment.amount / 100 : payment.amount) / 3.6725
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      USD
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section (Optional) */}
            {payment.notes && (
              <div className="rounded-lg border border-border p-3.5 bg-surface-muted/20 text-xs">
                <span className="font-semibold text-foreground-strong block mb-1">Notes:</span>
                <p className="text-foreground-muted leading-relaxed whitespace-pre-wrap">
                  {payment.notes}
                </p>
              </div>
            )}

            {/* Footer Notice */}
            <div className="text-center text-[10px] text-foreground-disabled pt-4 border-t border-border">
              Thank you for your business. For any questions, please contact support.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
