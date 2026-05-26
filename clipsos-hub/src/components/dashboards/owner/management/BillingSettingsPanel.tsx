/**
 * BillingSettingsPanel — Tab content for Settings > Billing
 *
 * Embedded version of billing management. Does NOT set its own header
 * (the parent OwnerSettingsPage handles that).
 *
 * Uses V2 design tokens only — no legacy surface or brand classes.
 */
import React, { useMemo } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Download, DollarSign, Users, Banknote } from "lucide-react";
import { format } from "date-fns";
import { useStripeCharges, useStripeSubscriptions, useClients } from "@/hooks/data";
import { fmtCents, usdHintCents } from "../finance/finance-helpers";

export function BillingSettingsPanel() {
  const { data: charges, isLoading: isLoadingCharges } = useStripeCharges();
  const { data: subscriptions } = useStripeSubscriptions();
  const { data: clients = [] } = useClients();

  // Map client emails to names to resolve missing database-level client_id links
  const clientEmailMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((c) => {
      if (c.email) {
        map.set(c.email.toLowerCase().trim(), c.name);
      }
    });
    return map;
  }, [clients]);

  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "created_at",
        header: "Date",
        render: (item: any) => (
          <span className="text-sm text-foreground-muted">
            {format(new Date(item.created_at), "MMM d, yyyy")}
          </span>
        ),
      },
      {
        key: "client",
        header: "Client",
        render: (item: any) => {
          let name = item.client?.name;
          if (!name && item.customer_email) {
            const emailKey = item.customer_email.toLowerCase().trim();
            name = clientEmailMap.get(emailKey);
          }
          return (
            <div className="flex flex-col">
              <span className="font-medium text-foreground-strong">{name || "Unknown"}</span>
              {item.customer_email && (
                <span className="text-xs text-foreground-muted">{item.customer_email}</span>
              )}
            </div>
          );
        },
      },
      {
        key: "amount",
        header: "Amount",
        render: (item: any) => {
          const aedDisplay = fmtCents(item.amount || 0, item.currency || "usd");
          const usdDisplay = usdHintCents(item.amount || 0, item.currency || "usd");
          return (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-mono text-foreground-strong">{aedDisplay}</span>
              <span className="text-[11px] text-foreground-disabled">{usdDisplay}</span>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        render: (item: any) => (
          <StatusBadge
            variant={item.status === "succeeded" ? "approved" : "draft"}
            label={item.status === "succeeded" ? "Paid" : item.status}
          />
        ),
      },
      {
        key: "receipt_url",
        header: "Invoice",
        render: (item: any) =>
          item.receipt_url ? (
            <a
              href={item.receipt_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:text-primary-glow flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              <span>Receipt</span>
            </a>
          ) : (
            <span className="text-foreground-disabled">-</span>
          ),
      },
    ],
    [clientEmailMap],
  );

  const totalRevenueCents = useMemo(() => {
    if (!charges) return 0;
    return charges
      .filter((c) => c.status === "succeeded")
      .reduce((acc, c) => acc + (c.amount || 0), 0);
  }, [charges]);

  const activeSubscriptionsCount = useMemo(() => {
    if (!subscriptions) return 0;
    return subscriptions.filter((s) => s.status === "active" || s.status === "trialing").length;
  }, [subscriptions]);

  const mrrCents = useMemo(() => {
    if (!subscriptions) return 0;
    return subscriptions
      .filter((s) => s.status === "active" || s.status === "trialing")
      .reduce((acc, s) => acc + (s.amount || 0), 0);
  }, [subscriptions]);

  return (
    <FullBleed>
      <div className="flex flex-col gap-6 px-3 py-5 md:px-5 md:py-6">
        {/* Action bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-foreground-muted md:text-sm">
            Manage global revenue, subscriptions, and payouts.
          </p>
        </div>

        {/* Premium KPI Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Total Revenue */}
          <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface-card transition-shadow hover:shadow-md">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 to-emerald-400" />
            <div className="flex flex-col gap-3 p-4 pt-5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-foreground-muted">
                  Total Revenue
                </span>
              </div>
              <p className="font-display text-xl font-semibold leading-none tracking-tight text-foreground-strong md:text-2xl">
                {fmtCents(totalRevenueCents)}
              </p>
              <span className="text-[11px] text-foreground-disabled">
                {usdHintCents(totalRevenueCents)}
              </span>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface-card transition-shadow hover:shadow-md">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 to-blue-500" />
            <div className="flex flex-col gap-3 p-4 pt-5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15">
                  <Users className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-foreground-muted">
                  Active Subscriptions
                </span>
              </div>
              <p className="font-display text-xl font-semibold leading-none tracking-tight text-foreground-strong md:text-2xl">
                {activeSubscriptionsCount}
              </p>
              <span className="text-[11px] text-foreground-disabled">Across client tenants</span>
            </div>
          </div>

          {/* MRR */}
          <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface-card transition-shadow hover:shadow-md">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amber-500 to-amber-400" />
            <div className="flex flex-col gap-3 p-4 pt-5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15">
                  <Banknote className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-foreground-muted">
                  MRR (Monthly Recurring)
                </span>
              </div>
              <p className="font-display text-xl font-semibold leading-none tracking-tight text-foreground-strong md:text-2xl">
                {fmtCents(mrrCents)}
              </p>
              <span className="text-[11px] text-foreground-disabled">{usdHintCents(mrrCents)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <h3
            className="text-base font-medium text-foreground-strong"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Recent Charges
          </h3>
          {isLoadingCharges ? (
            <div className="flex items-center justify-center h-48 border border-border rounded-xl bg-surface-card">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface-card overflow-hidden">
              <DataTable columns={columns} data={charges || []} rowKey={(row: any) => row.id} />
            </div>
          )}
        </div>
      </div>
    </FullBleed>
  );
}
