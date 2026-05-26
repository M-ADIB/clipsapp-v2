/**
 * DealsTab — Linked deals with stage/pipeline info.
 */

import { DollarSign } from "lucide-react";
import { formatDate } from "../utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface DealsTabProps {
  deals: Array<Record<string, any>>;
}

export function DealsTab({ deals }: DealsTabProps) {
  if (!deals || deals.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <DollarSign className="h-10 w-10 text-foreground-disabled" />
        <p className="text-sm font-medium text-foreground-muted">No deals</p>
        <p className="text-xs text-foreground-disabled">
          Deals linked to this person will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-disabled">
        Linked Deals ({deals.length})
      </h3>
      {deals.map((deal) => (
        <div
          key={deal.id}
          className="flex items-center justify-between rounded-lg border border-border bg-surface-card p-3.5 transition-colors hover:bg-surface-raised/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <DollarSign className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">{deal.name || "Untitled Deal"}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <p className="text-[10px] text-foreground-disabled">
                  {formatDate(deal.created_at)}
                </p>
                {deal.plan && (
                  <span className="text-[10px] text-foreground-muted">· {deal.plan}</span>
                )}
                {deal.amount != null && (
                  <span className="text-[10px] font-medium text-emerald-400">
                    {deal.currency ?? "AED"} {deal.amount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {deal.deal_owner && (
              <span className="text-[10px] text-foreground-disabled">{deal.deal_owner}</span>
            )}
            {deal.stage && (
              <span className="rounded-full bg-surface-raised px-2.5 py-0.5 text-[10px] font-medium text-foreground-muted">
                {deal.stage}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
