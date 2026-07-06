/**
 * CostsTab — Track salaries, subscriptions, contractor costs.
 * Full CRUD with active toggles, category filters, add/edit dialog.
 */
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";

import { costSchema, type CostFormValues } from "@/lib/forms/finance-schemas";

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

export function CostDialog({
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
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CostFormValues>({
    resolver: zodResolver(costSchema),
    defaultValues: {
      name: initial?.name ?? "",
      category: initial?.category ?? "subscription",
      amount: initial?.amount != null ? String(initial.amount) : "",
      currency: initial?.currency ?? "AED",
      isRecurring: initial?.is_recurring ?? true,
      recurrence: initial?.recurrence_interval ?? "monthly",
      nextDate: initial?.next_payment_date ?? "",
      credEmail: initial?.credentials_email ?? "",
      notes: initial?.notes ?? "",
    },
  });

  const isRecurring = watch("isRecurring");

  const onSubmit = (values: CostFormValues) => {
    onSave({
      id: initial?.id,
      name: values.name,
      category: values.category,
      amount: Number(values.amount) || 0,
      currency: values.currency,
      is_active: initial?.is_active ?? true,
      is_recurring: values.isRecurring,
      recurrence_interval: values.isRecurring ? values.recurrence : "one-time",
      next_payment_date: values.nextDate || null,
      credentials_email: values.credEmail || null,
      credentials_password_hint: null,
      notes: values.notes || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Cost" : "Add Cost"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="cost-name">Name</Label>
              <Input
                id="cost-name"
                placeholder="e.g. Cap Cut"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-status-danger" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
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
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="cost-amount">Amount</Label>
                <Input
                  id="cost-amount"
                  type="number"
                  placeholder="0.00"
                  aria-invalid={!!errors.amount}
                  {...register("amount")}
                />
                {errors.amount && (
                  <p className="text-xs text-status-danger" role="alert">
                    {errors.amount.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
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
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="AED">AED</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="cost-next">Next Payment</Label>
                <Input id="cost-next" type="date" {...register("nextDate")} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Controller
                control={control}
                name="isRecurring"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label>Recurring</Label>
              {isRecurring && (
                <Controller
                  control={control}
                  name="recurrence"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                />
              )}
            </div>
            <div>
              <Label htmlFor="cost-cred">Credentials Email (optional)</Label>
              <Input id="cost-cred" placeholder="admin@example.com" {...register("credEmail")} />
            </div>
            <div>
              <Label htmlFor="cost-notes">Notes</Label>
              <Input id="cost-notes" placeholder="Optional notes…" {...register("notes")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : initial?.id ? "Update" : "Add Cost"}
            </Button>
          </DialogFooter>
        </form>
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
