/**
 * FormSubmissionsPage — Shows all submissions for a specific form.
 * Includes a data table with per-field columns, CSV export, and submission detail drawer.
 */
import { useMemo, useState, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import { Download, ArrowLeft, Loader2, Search, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { useFormBySlug, useFormFields, useFormSubmissions } from "@/hooks/data";
import { useAuth } from "@/contexts/AuthContext";
import type { FormField, FormSubmission } from "@/integrations/supabase/db-types";
import type { Json } from "@/integrations/supabase/db-types";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { FullBleed } from "@/components/app-shell/FullBleed";

export function FormSubmissionsPage() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const { role } = useAuth();
  const rolePrefix = role === "manager" ? "/manager" : "/owner";

  const { data: form, isLoading: formLoading } = useFormBySlug(slug);
  const { data: fields } = useFormFields(form?.id);
  const { data: subData, isLoading: subsLoading } = useFormSubmissions(form?.id);

  const submissions = subData?.data ?? [];

  const [search, setSearch] = useState("");
  const [selectedSub, setSelectedSub] = useState<FormSubmission | null>(null);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  useEffect(() => {
    const title = form?.title ? `${form.title} — Submissions` : "Submissions";
    setHeaderConfig({ title, tabs: [] });
    return () => clearHeaderConfig();
  }, [form?.title, setHeaderConfig, clearHeaderConfig]);

  // Build column headers from fields
  const columns = useMemo(() => {
    if (!fields) return [];
    return fields
      .filter((f) => !["heading", "paragraph"].includes(f.field_type))
      .map((f) => ({ id: f.id, label: f.label }));
  }, [fields]);

  // Filter + sort
  const displaySubs = useMemo(() => {
    let result = [...submissions];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => {
        const raw = JSON.stringify(s.data ?? {}).toLowerCase();
        return (
          raw.includes(q) ||
          (s.submitter_email ?? "").toLowerCase().includes(q) ||
          (s.submitter_name ?? "").toLowerCase().includes(q)
        );
      });
    }
    result.sort((a, b) => {
      if (sortField === "created_at") {
        return sortDir === "desc"
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      const aVal = String(getFieldValue(a.data, sortField));
      const bVal = String(getFieldValue(b.data, sortField));
      return sortDir === "desc" ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    });
    return result;
  }, [submissions, search, sortField, sortDir]);

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function exportCsv() {
    if (!fields || !submissions.length) return;
    const headers = ["Submitted At", "Email", "Name", ...columns.map((c) => c.label)];
    const rows = submissions.map((s) => [
      new Date(s.created_at).toLocaleString(),
      s.submitter_email ?? "",
      s.submitter_name ?? "",
      ...columns.map((c) => formatCellValue(getFieldValue(s.data, c.id))),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form?.slug ?? "form"}-submissions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  if (formLoading || subsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <FullBleed>
      <div className="flex flex-col gap-6 px-3 py-5 md:px-5 md:py-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <a href={`${rolePrefix}/forms`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </a>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{subData?.total ?? 0} total submissions</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!submissions.length}
            onClick={exportCsv}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search responses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Table */}
        {!displaySubs.length ? (
          <Card className="flex flex-col items-center justify-center py-16 border-dashed">
            <p className="text-sm text-muted-foreground">No submissions yet</p>
          </Card>
        ) : (
          <Card className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead
                    label="Submitted"
                    field="created_at"
                    current={sortField}
                    dir={sortDir}
                    onToggle={toggleSort}
                  />
                  <TableHead className="text-xs">Email</TableHead>
                  {columns.map((c) => (
                    <SortableHead
                      key={c.id}
                      label={c.label}
                      field={c.id}
                      current={sortField}
                      dir={sortDir}
                      onToggle={toggleSort}
                    />
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displaySubs.map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer hover:bg-accent/5"
                    onClick={() => setSelectedSub(s)}
                  >
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(s.created_at).toLocaleDateString()}{" "}
                      <span className="text-muted-foreground">
                        {new Date(s.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.submitter_email ?? "—"}
                    </TableCell>
                    {columns.map((c) => (
                      <TableCell key={c.id} className="text-xs max-w-[200px] truncate">
                        {formatCellValue(getFieldValue(s.data, c.id))}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Detail Sheet */}
        <Sheet open={!!selectedSub} onOpenChange={(open) => !open && setSelectedSub(null)}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            {selectedSub && (
              <>
                <SheetHeader>
                  <SheetTitle>Submission Detail</SheetTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedSub.created_at).toLocaleString()} ·{" "}
                    {selectedSub.submitter_email ?? "Anonymous"}
                  </p>
                  <Badge variant="secondary" className="w-fit text-[10px]">
                    {selectedSub.status}
                  </Badge>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {columns.map((c) => {
                    const val = getFieldValue(selectedSub.data, c.id);
                    return (
                      <div key={c.id}>
                        <p className="text-xs font-medium text-muted-foreground mb-1">{c.label}</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {formatCellValue(val) || "—"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </FullBleed>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function SortableHead({
  label,
  field,
  current,
  dir,
  onToggle,
}: {
  label: string;
  field: string;
  current: string;
  dir: "asc" | "desc";
  onToggle: (f: string) => void;
}) {
  const active = current === field;
  return (
    <TableHead
      className="text-xs cursor-pointer select-none hover:text-foreground whitespace-nowrap"
      onClick={() => onToggle(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        {active &&
          (dir === "desc" ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronUp className="h-3 w-3" />
          ))}
      </span>
    </TableHead>
  );
}

function getFieldValue(data: Json, fieldId: string): unknown {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return (data as Record<string, unknown>)[fieldId];
  }
  return undefined;
}

function formatCellValue(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
