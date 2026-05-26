/**
 * ContentTab — Studio Scripts for this client workspace.
 *
 * Wired to:
 *   useStudioScripts(clientId)  → studio_scripts table
 *   useClientCycles(clientId)   → cycles table
 *   useCreateScript()           → mutation to create a script
 *   useUpdateScript()           → mutation to update script details/body
 *   useDeleteScript()           → mutation to delete a script
 *
 * Shows a premium accordion list of all saved scripts from Content Studio.
 * Allows editing script details and writing body content directly.
 */
import { useState, useMemo } from "react";
import {
  useStudioScripts,
  useClientCycles,
  useCreateScript,
  useUpdateScript,
  useDeleteScript,
} from "@/hooks/data";
import {
  FileText,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Film,
  Copy,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  Circle,
  FileEdit,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { RichTextEditor } from "../studio/RichTextEditor";
import type { Json } from "@/integrations/supabase/types";

interface ContentTabProps {
  clientId: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${days[d.getDay()]} • ${months[d.getMonth()]} ${d.getDate()}`;
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

function ScriptStatusIcon({ status }: { status: string | null }) {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
    case "in_review":
      return <Clock className="h-3.5 w-3.5 text-amber-400" />;
    case "filmed":
      return <Film className="h-3.5 w-3.5 text-blue-400" />;
    default:
      return <Circle className="h-3.5 w-3.5 text-foreground-disabled" />;
  }
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "filmed", label: "Filmed" },
];

export function ContentTab({ clientId }: ContentTabProps) {
  const { data: scripts, isLoading: scriptsLoading } = useStudioScripts(clientId);
  const { data: cycles } = useClientCycles(clientId);

  const createScript = useCreateScript();
  const updateScript = useUpdateScript();
  const deleteScript = useDeleteScript();

  // Search & filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedScriptId, setExpandedScriptId] = useState<string | null>(null);

  // New script dialog state
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCycleId, setNewCycleId] = useState<string>("none");
  const [newVideoType, setNewVideoType] = useState("");
  const [newScriptType, setNewScriptType] = useState("");

  // Map of cycles for fast lookup
  const cycleMap = useMemo(() => {
    const map = new Map<string, string>();
    cycles?.forEach((c) => {
      map.set(c.id, c.name);
    });
    return map;
  }, [cycles]);

  // Filtered scripts list
  const filteredScripts = useMemo(() => {
    if (!scripts) return [];
    let list = scripts;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.video_type?.toLowerCase().includes(q) ||
          s.script_type?.toLowerCase().includes(q) ||
          s.body?.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }

    return list;
  }, [scripts, search, statusFilter]);

  const handleCreateScript = async () => {
    if (!newTitle.trim()) return;

    try {
      await createScript.mutateAsync({
        client_id: clientId,
        title: newTitle.trim(),
        cycle_id: newCycleId === "none" ? null : newCycleId,
        video_type: newVideoType.trim() || null,
        script_type: newScriptType.trim() || null,
        status: "draft",
        order_index: (scripts?.length ?? 0) + 1,
        body_json: { type: "doc", content: [] } as Json,
      });

      toast.success("Script created successfully!");
      setNewDialogOpen(false);
      setNewTitle("");
      setNewCycleId("none");
      setNewVideoType("");
      setNewScriptType("");
    } catch (err: any) {
      toast.error(`Failed to create script: ${err.message}`);
    }
  };

  const handleDeleteScript = async (scriptId: string) => {
    if (!confirm("Are you sure you want to delete this script?")) return;

    try {
      await deleteScript.mutateAsync({ id: scriptId, client_id: clientId });
      toast.success("Script deleted successfully");
      if (expandedScriptId === scriptId) {
        setExpandedScriptId(null);
      }
    } catch (err: any) {
      toast.error(`Failed to delete script: ${err.message}`);
    }
  };

  const copyToClipboard = (text: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Script content copied to clipboard!");
  };

  return (
    <div className="flex flex-col gap-4 pt-4">
      {/* ── Toolbar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-disabled" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scripts by title or type…"
            className="h-9 w-full rounded-lg border border-border-strong bg-surface-card pl-9 pr-3 text-xs text-foreground placeholder:text-foreground-disabled focus:border-primary focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="w-[140px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 bg-surface-card border-border-strong text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="filmed">Filmed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Create Script Trigger */}
        <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 ml-auto">
              <Plus className="h-3.5 w-3.5" />
              New Script
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground-strong flex items-center gap-2">
                <FileEdit className="h-4 w-4 text-primary" />
                Create New Script
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Script Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. 3 Tips for Personal Branding"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-surface-input border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="video-type">Video Type</Label>
                  <Input
                    id="video-type"
                    placeholder="e.g. Short-form"
                    value={newVideoType}
                    onChange={(e) => setNewVideoType(e.target.value)}
                    className="bg-surface-input border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="script-type">Script Type</Label>
                  <Input
                    id="script-type"
                    placeholder="e.g. YouTube Short"
                    value={newScriptType}
                    onChange={(e) => setNewScriptType(e.target.value)}
                    className="bg-surface-input border-border"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Content Cycle</Label>
                <Select value={newCycleId} onValueChange={setNewCycleId}>
                  <SelectTrigger className="bg-surface-input border-border text-xs">
                    <SelectValue placeholder="Select writing cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Standalone (No Cycle)</SelectItem>
                    {cycles?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={() => setNewDialogOpen(false)}
                disabled={createScript.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateScript}
                disabled={!newTitle.trim() || createScript.isPending}
              >
                {createScript.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Script"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Script List ────────────────────────────────────── */}
      {scriptsLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredScripts.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface-card/30 p-8">
          <FileText className="h-10 w-10 text-foreground-disabled" />
          <span className="text-sm font-medium text-foreground-muted">No scripts found</span>
          <span className="text-xs text-foreground-disabled text-center max-w-xs">
            {search || statusFilter !== "all"
              ? "Try adjusting your search query or filters to locate client scripts."
              : "No scripts have been created for this client workspace yet. Click 'New Script' to start writing."}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredScripts.map((script) => {
            const isExpanded = expandedScriptId === script.id;
            const cycleName = script.cycle_id ? cycleMap.get(script.cycle_id) : null;

            return (
              <div
                key={script.id}
                className={`border rounded-xl bg-surface-card transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? "border-primary/45 shadow-[0_0_15px_-3px_color-mix(in_oklab,var(--primary)_15%,transparent)]"
                    : "border-border-strong hover:border-border-strong-hover"
                }`}
              >
                {/* Script Header Row */}
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-foreground/[0.01] transition-colors"
                  onClick={() => setExpandedScriptId(isExpanded ? null : script.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Collapsible toggle status */}
                    <div className="shrink-0 p-0.5 rounded hover:bg-foreground/[0.04]">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-foreground-disabled" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-foreground-disabled" />
                      )}
                    </div>

                    <div className="shrink-0">
                      <ScriptStatusIcon status={script.status} />
                    </div>

                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {script.title || "Untitled Script"}
                        </span>
                        {script.filmed && (
                          <Badge
                            variant="outline"
                            className="text-[9px] border-emerald-500/30 bg-emerald-500/5 text-emerald-400 gap-1 px-1.5 py-0.5"
                          >
                            <Film className="h-2.5 w-2.5" />
                            Filmed
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 text-[10px] text-foreground-disabled">
                        {cycleName && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {cycleName}
                          </span>
                        )}
                        {script.video_type && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-foreground/[0.05] text-foreground-muted">
                            <Tag className="w-2.5 h-2.5" />
                            {script.video_type}
                          </span>
                        )}
                        {script.script_type && (
                          <span className="text-foreground-disabled">• {script.script_type}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-foreground-disabled">
                      {formatRelative(script.updated_at)}
                    </span>
                    <Badge
                      className={`text-[10px] uppercase font-bold tracking-wide ${
                        script.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400 border-none"
                          : script.status === "in_review"
                            ? "bg-amber-500/10 text-amber-400 border-none"
                            : script.status === "filmed"
                              ? "bg-blue-500/10 text-blue-400 border-none"
                              : "bg-foreground/[0.07] text-foreground-muted border-none"
                      }`}
                    >
                      {script.status?.replace("_", " ") ?? "Draft"}
                    </Badge>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border-strong pt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Controls row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-foreground/[0.02] border border-border-strong rounded-lg p-3">
                      {/* Status select */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-foreground-disabled uppercase tracking-wider block">
                          Status
                        </span>
                        <Select
                          value={script.status || "draft"}
                          onValueChange={(val) =>
                            updateScript.mutate({ id: script.id, client_id: clientId, status: val })
                          }
                        >
                          <SelectTrigger className="h-8 bg-background border-border-strong text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Content Cycle select */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-foreground-disabled uppercase tracking-wider block">
                          Cycle
                        </span>
                        <Select
                          value={script.cycle_id || "none"}
                          onValueChange={(val) =>
                            updateScript.mutate({
                              id: script.id,
                              client_id: clientId,
                              cycle_id: val === "none" ? null : val,
                            })
                          }
                        >
                          <SelectTrigger className="h-8 bg-background border-border-strong text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Cycle</SelectItem>
                            {cycles?.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Video Type text field */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-foreground-disabled uppercase tracking-wider block">
                          Video Type
                        </span>
                        <input
                          type="text"
                          value={script.video_type || ""}
                          placeholder="e.g. Short-form"
                          onChange={(e) =>
                            updateScript.mutate({
                              id: script.id,
                              client_id: clientId,
                              video_type: e.target.value,
                            })
                          }
                          className="h-8 w-full rounded-md border border-border-strong bg-background px-2 text-xs focus:border-primary focus:outline-none"
                        />
                      </div>

                      {/* Script Type text field */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-foreground-disabled uppercase tracking-wider block">
                          Script Type
                        </span>
                        <input
                          type="text"
                          value={script.script_type || ""}
                          placeholder="e.g. Instagram Reel"
                          onChange={(e) =>
                            updateScript.mutate({
                              id: script.id,
                              client_id: clientId,
                              script_type: e.target.value,
                            })
                          }
                          className="h-8 w-full rounded-md border border-border-strong bg-background px-2 text-xs focus:border-primary focus:outline-none"
                        />
                      </div>

                      {/* Filmed Toggle & Actions */}
                      <div className="flex items-center justify-between sm:justify-start gap-4 pt-1 sm:pt-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={script.filmed ?? false}
                            onCheckedChange={(val) =>
                              updateScript.mutate({
                                id: script.id,
                                client_id: clientId,
                                filmed: val,
                              })
                            }
                          />
                          <span className="text-xs text-foreground-muted flex items-center gap-1">
                            <Film className="h-3.5 w-3.5 text-foreground-disabled" />
                            Filmed
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RichTextEditor area */}
                    <div className="border border-border-strong rounded-xl bg-background overflow-hidden">
                      <RichTextEditor
                        content={(script.body_json as Record<string, unknown>) ?? script.body ?? ""}
                        placeholder="Write your script body here..."
                        onSave={(json) =>
                          updateScript.mutate({
                            id: script.id,
                            client_id: clientId,
                            body_json: json as Json,
                          })
                        }
                        minHeight="200px"
                      />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteScript(script.id)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1.5 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Script
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(script.body)}
                        className="gap-1.5 text-xs h-8 border-border-strong hover:bg-foreground/[0.02]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Script Text
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
