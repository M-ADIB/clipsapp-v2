/**
 * CostsTab — Track salaries, subscriptions, contractor costs.
 * Full CRUD with active toggles, category filters, add/edit dialog.
 */
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";

import {
  useOperatingCosts,
  useCreateOperatingCost,
  useUpdateOperatingCost,
  useDeleteOperatingCost,
  type OperatingCost,
  type OperatingCostInsert,
} from "@/hooks/use-operating-costs";
import { StatCard, FilterPills } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { fmtAmount, usdHint, isThisMonth, CATEGORY_COLORS, safeParseDate } from "./finance-helpers";

const CATEGORY_PILLS = ["All", "Salary", "Subscription", "Contractor"] as const;
const CATEGORIES = ["salary", "subscription", "contractor", "other"] as const;

/* ------------------------------------------------------------------ */
/* Add / Edit Dialog                                                   */
/* ------------------------------------------------------------------ */
type CostFormData = {
  id?: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  is_active: boolean;
  is_recurring: boolean;
  recurrence_interval: string | null;
  next_payment_date: string | null;
  credentials_email: string | null;
  credentials_password_hint: string | null;
  notes: string | null;
};

function CostDialog({
  open,
  onClose,
  initial,
  onSave,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Partial<CostFormData>;
  onSave: (data: CostFormData) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "subscription");
  const [amount, setAmount] = useState(String(initial?.amount ?? ""));
  const [currency, setCurrency] = useState(initial?.currency ?? "AED");
  const [isRecurring, setIsRecurring] = useState(initial?.is_recurring ?? true);
  const [recurrence, setRecurrence] = useState(initial?.recurrence_interval ?? "monthly");
  const [nextDate, setNextDate] = useState(initial?.next_payment_date ?? "");
  const [credEmail, setCredEmail] = useState(initial?.credentials_email ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const handleSubmit = () => {
    onSave({
      id: initial?.id,
      name,
      category,
      amount: Number(amount) || 0,
      currency,
      is_active: initial?.is_active ?? true,
      is_recurring: isRecurring,
      recurrence_interval: isRecurring ? recurrence : "one-time",
      next_payment_date: nextDate || null,
      credentials_email: credEmail || null,
      credentials_password_hint: null,
      notes: notes || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Cost" : "Add Cost"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cap Cut"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Next Payment</Label>
              <Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
            <Label>Recurring</Label>
            {isRecurring && (
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label>Credentials Email (optional)</Label>
            <Input
              value={credEmail}
              onChange={(e) => setCredEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <Label>Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !name || !amount}>
            {saving ? "Saving…" : initial?.id ? "Update" : "Add Cost"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */
export function CostsTab() {
  const { data: costs = [], isLoading } = useOperatingCosts();
  const createCost = useCreateOperatingCost();
  const updateCost = useUpdateOperatingCost();
  const deleteCost = useDeleteOperatingCost();

  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<CostFormData> | undefined>();

  // ── KPIs ───────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const active = costs.filter((c) => c.is_active);
    const activeTotal = active.reduce((s, c) => s + Number(c.amount), 0);
    const thisMonthCosts = active.filter((c) => isThisMonth(c.next_payment_date));
    const thisMonth = thisMonthCosts.reduce((s, c) => s + Number(c.amount), 0);
    const upcomingCosts = active.filter((c) => {
      if (!c.next_payment_date) return false;
      const d = safeParseDate(c.next_payment_date);
      return d && d >= new Date();
    });
    const upcoming = upcomingCosts.reduce((s, c) => s + Number(c.amount), 0);
    return { thisMonth, activeTotal, upcoming };
  }, [costs]);

  // ── Filtered rows ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (categoryFilter === "All") return costs;
    return costs.filter((c) => c.category === categoryFilter.toLowerCase());
  }, [costs, categoryFilter]);

  // ── Handlers ───────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };
  const openEdit = (cost: (typeof costs)[0]) => {
    setEditing({ ...cost, id: cost.id });
    setDialogOpen(true);
  };

  const handleSave = async (data: CostFormData) => {
    if (data.id) {
      const { id, ...updates } = data;
      await updateCost.mutateAsync({ id, ...updates });
    } else {
      const { id: _unused, ...insertData } = data;
      await createCost.mutateAsync(insertData);
    }
    setDialogOpen(false);
    setEditing(undefined);
  };

  const handleToggleActive = (cost: (typeof costs)[0]) => {
    updateCost.mutate({ id: cost.id, is_active: !cost.is_active });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this cost item?")) {
      deleteCost.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard
          title="This Month"
          value={fmtAmount(kpis.thisMonth)}
          subtitle={usdHint(kpis.thisMonth)}
        />
        <StatCard
          title="Active Total"
          value={fmtAmount(kpis.activeTotal)}
          subtitle={usdHint(kpis.activeTotal)}
        />
        <StatCard
          title="Upcoming This Cycle"
          value={fmtAmount(kpis.upcoming)}
          subtitle={usdHint(kpis.upcoming)}
        />
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills
          pills={CATEGORY_PILLS.map((c) => ({ label: c, value: c }))}
          active={categoryFilter}
          onSelect={setCategoryFilter}
        />
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Cost
        </Button>
      </div>

      {/* ── Costs Table ───────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Active", "Item Name", "Category", "Credentials", "Amount", "Payment Date", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[11px] font-normal uppercase tracking-wide text-foreground-disabled"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-foreground-disabled">
                  No costs tracked yet
                </td>
              </tr>
            ) : (
              filtered.map((cost) => (
                <tr
                  key={cost.id}
                  className={`border-b border-border transition-colors hover:bg-foreground/[0.03] ${
                    !cost.is_active ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <Switch
                      checked={cost.is_active}
                      onCheckedChange={() => handleToggleActive(cost)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground-strong">{cost.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        CATEGORY_COLORS[cost.category] ?? CATEGORY_COLORS.other
                      }`}
                    >
                      {cost.category.charAt(0).toUpperCase() + cost.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground-muted">
                    {cost.credentials_email ? (
                      <div>
                        <p>{cost.credentials_email}</p>
                        {cost.credentials_password_hint && <p className="font-mono">🔑 ••••••••</p>}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="font-mono text-foreground-strong">
                      {fmtAmount(Number(cost.amount), cost.currency)}
                    </span>
                    <span className="ml-1.5 text-[11px] text-foreground-disabled">
                      {usdHint(Number(cost.amount), cost.currency)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {cost.next_payment_date && (
                        <>
                          <Calendar className="h-3 w-3 text-foreground-muted" />
                          <span className="text-foreground-muted">
                            {(() => {
                              const d = safeParseDate(cost.next_payment_date);
                              return d ? format(d, "MMM d, yyyy") : "—";
                            })()}
                          </span>
                        </>
                      )}
                      {cost.is_recurring && (
                        <span className="ml-1 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          Recurring
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(cost)}
                        className="rounded p-1 text-foreground-muted hover:bg-foreground/10 hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cost.id)}
                        className="rounded p-1 text-foreground-muted hover:bg-[color:var(--status-danger)]/10 hover:text-[color:var(--status-danger)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add/Edit Dialog ───────────────────────────────────────────── */}
      <CostDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(undefined);
        }}
        initial={editing}
        onSave={handleSave}
        saving={createCost.isPending || updateCost.isPending}
      />
    </div>
  );
}
