import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  useClients,
  useUpdateClient,
  useVideos,
  useTeam,
  useClientTeamAssignments,
  useAssignTeamMember,
  useUnassignTeamMember,
  useStripeSubscriptions,
} from "@/hooks/data";
import {
  Search,
  Check,
  UserPlus,
  Loader2,
  Calendar,
  ExternalLink,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ProductionOverviewTable() {
  const navigate = useNavigate();
  const { role } = useAuth();

  // Role path prefix mappings
  const rolePathMap: Record<string, string> = {
    owner: "/owner/clients/$clientSlug",
    manager: "/manager/clients/$clientSlug",
    senior_editor: "/senior-editor/clients/$clientSlug",
    content_creator: "/content-creator/clients/$clientSlug",
  };
  const clientWorkspaceBase = rolePathMap[role ?? "owner"] ?? "/owner/clients/$clientSlug";

  // Data fetching
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: videos = [], isLoading: videosLoading } = useVideos();
  const { data: team = [] } = useTeam();
  const { data: assignments = [], isLoading: assignmentsLoading } = useClientTeamAssignments();
  const { data: subscriptions = [] } = useStripeSubscriptions();

  // Mutations
  const updateClient = useUpdateClient();
  const assignTeamMember = useAssignTeamMember();
  const unassignTeamMember = useUnassignTeamMember();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planValue, setPlanValue] = useState("");
  const [editingPaymentsId, setEditingPaymentsId] = useState<string | null>(null);
  const [paymentsValue, setPaymentsValue] = useState("");

  // Memoized lookups
  const assignmentsByClient = useMemo(() => {
    const map = new Map<string, typeof assignments>();
    for (const assoc of assignments) {
      const list = map.get(assoc.client_id) ?? [];
      list.push(assoc);
      map.set(assoc.client_id, list);
    }
    return map;
  }, [assignments]);

  const subscriptionsByClient = useMemo(() => {
    const map = new Map<string, typeof subscriptions[0]>();
    for (const sub of subscriptions) {
      if (sub.client_id) map.set(sub.client_id, sub);
    }
    return map;
  }, [subscriptions]);

  // Aggregate video counts per client
  const clientVideoMetrics = useMemo(() => {
    const map = new Map<
      string,
      {
        existingCount: number;
        newCount: number;
        totalCount: number;
        completedCount: number;
        inProgressCount: number;
        inReviewCount: number;
        breakdownText: string;
      }
    >();

    // Group videos by client
    const videosByClient = new Map<string, typeof videos>();
    for (const v of videos) {
      const list = videosByClient.get(v.client_id) ?? [];
      list.push(v);
      videosByClient.set(v.client_id, list);
    }

    for (const c of clients) {
      const cVids = videosByClient.get(c.id) ?? [];
      
      // Determine the active cycle: cycle with active videos (in scripting, progress, editing, review)
      const nonTerminalSlugs = new Set(["scripting", "assigned", "in_progress", "editing", "in_review", "changes_requested"]);
      
      // Group client videos by cycle_id
      const cycleVideos = new Map<string, typeof videos>();
      let noCycleVids: typeof videos = [];

      for (const v of cVids) {
        if (v.cycle_id) {
          const list = cycleVideos.get(v.cycle_id) ?? [];
          list.push(v);
          cycleVideos.set(v.cycle_id, list);
        } else {
          noCycleVids.push(v);
        }
      }

      // Find active cycle_id (the one with highest cycle_number containing non-terminal videos)
      let activeCycleId: string | null = null;
      let maxActiveCycleNum = -1;

      cycleVideos.forEach((vids, cycleId) => {
        const firstVid = vids[0];
        const cycleNum = firstVid.cycle?.cycle_number ?? 0;
        const hasActive = vids.some(v => nonTerminalSlugs.has(v.status?.slug ?? ""));
        
        if (hasActive && cycleNum > maxActiveCycleNum) {
          maxActiveCycleNum = cycleNum;
          activeCycleId = cycleId;
        }
      });

      // If no cycle matches active videos, fallback to the latest cycle number overall
      if (!activeCycleId) {
        let maxCycleNum = -1;
        cycleVideos.forEach((vids, cycleId) => {
          const cycleNum = vids[0].cycle?.cycle_number ?? 0;
          if (cycleNum > maxCycleNum) {
            maxCycleNum = cycleNum;
            activeCycleId = cycleId;
          }
        });
      }

      // Calculations
      let existingCount = 0;
      let newCount = 0;
      let completedCount = 0;
      let inProgressCount = 0;
      let inReviewCount = 0;

      cVids.forEach(v => {
        const slug = v.status?.slug ?? "draft";
        const isDone = ["approved", "posted", "published", "scheduled"].includes(slug);
        const isInReview = ["in_review", "changes_requested"].includes(slug);
        
        if (v.cycle_id && v.cycle_id === activeCycleId) {
          existingCount++;
          if (isDone) completedCount++;
          else if (isInReview) inReviewCount++;
          else inProgressCount++;
        } else if (!v.cycle_id || (v.cycle?.cycle_number && activeCycleId && v.cycle.cycle_number > maxActiveCycleNum)) {
          newCount++;
        } else {
          // Historical videos
          if (isDone) completedCount++;
        }
      });

      // Fallback: if no active cycle structure, use in-progress as existing, drafts as new
      if (existingCount === 0 && newCount === 0 && cVids.length > 0) {
        cVids.forEach(v => {
          const slug = v.status?.slug ?? "draft";
          if (slug === "draft" || slug === "scripting") {
            newCount++;
          } else {
            existingCount++;
            if (["approved", "posted", "published", "scheduled"].includes(slug)) completedCount++;
            else if (["in_review", "changes_requested"].includes(slug)) inReviewCount++;
            else inProgressCount++;
          }
        });
      }

      const breakdownText = `${completedCount} Done, ${inProgressCount} Progress, ${inReviewCount} Review`;

      map.set(c.id, {
        existingCount,
        newCount,
        totalCount: existingCount + newCount,
        completedCount,
        inProgressCount,
        inReviewCount,
        breakdownText,
      });
    }

    return map;
  }, [clients, videos]);

  // Handle client updates
  const handleSaveNotes = (clientId: string) => {
    updateClient.mutate({ id: clientId, notes: notesValue });
    setEditingNotesId(null);
  };

  const handleSavePlan = (clientId: string) => {
    const val = parseInt(planValue, 10);
    if (!isNaN(val)) {
      updateClient.mutate({ id: clientId, videos_per_month: val });
    }
    setEditingPlanId(null);
  };

  const handleSavePayments = (clientId: string, settings: any) => {
    updateClient.mutate({
      id: clientId,
      settings: {
        ...(settings || {}),
        payment_status: paymentsValue,
      },
    });
    setEditingPaymentsId(null);
  };

  const handleUpdateShoots = (clientId: string, shoots: string, settings: any) => {
    updateClient.mutate({
      id: clientId,
      settings: {
        ...(settings || {}),
        shoots_required: shoots,
      },
    });
  };

  const toggleEditorAssignment = async (clientId: string, userId: string, isAssigned: boolean) => {
    if (isAssigned) {
      await unassignTeamMember.mutateAsync({ clientId, userId });
    } else {
      await assignTeamMember.mutateAsync({ clientId, userId });
    }
  };

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      // Exclude churned/archived by default from overview unless explicitly active
      if (c.account_status === "churned") return false;

      const nameMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.industry ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      const assignedList = assignmentsByClient.get(c.id) ?? [];
      const editorMatch = searchTerm === "" || assignedList.some(assoc => 
        (assoc.profile as any)?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesSearch = nameMatch || editorMatch;
      
      if (statusFilter === "all") return matchesSearch;
      return matchesSearch && c.account_status === statusFilter;
    });
  }, [clients, searchTerm, statusFilter, assignmentsByClient]);

  const isLoading = clientsLoading || videosLoading || assignmentsLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-disabled" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients or assigned editors..."
            className="pl-9 h-9 text-xs focus-visible:ring-primary focus-visible:border-primary-glow"
          />
        </div>
        <div className="flex items-center gap-2">
          {["all", "active", "trial", "onboarding", "paused"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className="h-8 rounded-full px-3 text-xs capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <div className="rounded-xl border border-border bg-surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-surface-muted/30">
                <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-foreground-disabled">
                  Client Name
                </th>
                <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-foreground-disabled w-24">
                  Plan
                </th>
                <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-foreground-disabled w-40">
                  Payments
                </th>
                <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-foreground-disabled w-36 text-center">
                  Existing Session
                </th>
                <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-foreground-disabled w-32 text-center">
                  New Session
                </th>
                <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-foreground-disabled w-24 text-center">
                  Total
                </th>
                <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-foreground-disabled w-44">
                  Editor Assigned
                </th>
                <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-foreground-disabled w-44">
                  Shoots Required
                </th>
                <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-foreground-disabled">
                  Notes
                </th>
                <th className="px-3 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredClients.map((client) => {
                const metrics = clientVideoMetrics.get(client.id) ?? {
                  existingCount: 0,
                  newCount: 0,
                  totalCount: 0,
                  completedCount: 0,
                  inProgressCount: 0,
                  inReviewCount: 0,
                  breakdownText: "0 videos",
                };

                const clientAssoc = assignmentsByClient.get(client.id) ?? [];
                const stripeSub = subscriptionsByClient.get(client.id);

                // Derive payment status label
                const manualPayments = (client.settings as any)?.payment_status;
                const derivedPaymentLabel = manualPayments
                  ? manualPayments
                  : stripeSub
                  ? stripeSub.status === "active"
                    ? "fully paid"
                    : stripeSub.status
                  : client.account_status === "paused"
                  ? "PAUSED / CANCELLED"
                  : "fully paid"; // default fallback

                const currentShoots = (client.settings as any)?.shoots_required ?? "No Shoot";

                return (
                  <tr
                    key={client.id}
                    className="hover:bg-surface-raised/40 transition-colors group"
                  >
                    {/* Client Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {client.logo_url ? (
                          <Avatar className="h-8 w-8 rounded-lg shrink-0 border border-border">
                            <AvatarImage src={client.logo_url} alt={client.name} />
                            <AvatarFallback className="rounded-lg text-xs font-bold bg-surface-muted text-foreground-subtle">
                              {client.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="h-8 w-8 rounded-lg shrink-0 border border-border">
                            <AvatarFallback className="rounded-lg text-xs font-bold bg-surface-muted text-foreground-subtle">
                              {client.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span
                            onClick={() =>
                              navigate({
                                to: clientWorkspaceBase,
                                params: { clientSlug: client.slug ?? client.id },
                              })
                            }
                            className="text-xs font-semibold text-foreground hover:text-primary hover:underline cursor-pointer truncate"
                          >
                            {client.name}
                          </span>
                          <span className="text-[10px] text-foreground-disabled truncate capitalize">
                            {client.account_status} • {client.industry ?? "No Industry"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-4 py-3 font-semibold text-xs">
                      {editingPlanId === client.id ? (
                        <Input
                          value={planValue}
                          type="number"
                          onChange={(e) => setPlanValue(e.target.value)}
                          onBlur={() => handleSavePlan(client.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSavePlan(client.id);
                            if (e.key === "Escape") setEditingPlanId(null);
                          }}
                          className="h-7 px-1 text-xs w-16 focus-visible:ring-primary"
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() => {
                            setPlanValue(String(client.videos_per_month ?? "0"));
                            setEditingPlanId(client.id);
                          }}
                          className="cursor-pointer hover:bg-surface-raised px-1 py-0.5 rounded transition-colors inline-block min-w-[30px]"
                        >
                          {client.videos_per_month ?? "—"}
                        </div>
                      )}
                    </td>

                    {/* Payments */}
                    <td className="px-4 py-3 text-xs">
                      {editingPaymentsId === client.id ? (
                        <Input
                          value={paymentsValue}
                          onChange={(e) => setPaymentsValue(e.target.value)}
                          onBlur={() => handleSavePayments(client.id, client.settings)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSavePayments(client.id, client.settings);
                            if (e.key === "Escape") setEditingPaymentsId(null);
                          }}
                          className="h-7 px-1.5 text-xs w-32 focus-visible:ring-primary"
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() => {
                            setPaymentsValue(derivedPaymentLabel);
                            setEditingPaymentsId(client.id);
                          }}
                          className="cursor-pointer"
                        >
                          <Badge
                            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide capitalize ${
                              derivedPaymentLabel.toLowerCase().includes("fully paid")
                                ? "bg-status-success/10 text-status-success border border-status-success/30 hover:bg-status-success/20"
                                : derivedPaymentLabel.toLowerCase().includes("owes us") ||
                                  derivedPaymentLabel.toLowerCase().includes("past")
                                ? "bg-status-danger/10 text-status-danger border border-status-danger/30 hover:bg-status-danger/20"
                                : derivedPaymentLabel.toLowerCase().includes("cancel") ||
                                  derivedPaymentLabel.toLowerCase().includes("paused")
                                ? "bg-foreground-disabled/10 text-foreground-disabled border border-border-strong hover:bg-foreground-disabled/20"
                                : "bg-status-warning/10 text-status-warning border border-status-warning/30 hover:bg-status-warning/20"
                            }`}
                          >
                            {derivedPaymentLabel}
                          </Badge>
                        </div>
                      )}
                    </td>

                    {/* Existing Session */}
                    <td className="px-4 py-3 text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex flex-col items-center gap-1 cursor-default">
                              <span className="text-xs font-semibold text-foreground">
                                {metrics.existingCount}
                              </span>
                              {metrics.existingCount > 0 && (
                                <div className="flex h-1.5 w-16 overflow-hidden rounded-full bg-surface-raised border border-border/30">
                                  <div
                                    className="bg-status-success transition-all duration-300"
                                    style={{
                                      width: `${(metrics.completedCount / metrics.existingCount) * 100}%`,
                                    }}
                                  />
                                  <div
                                    className="bg-status-warning transition-all duration-300"
                                    style={{
                                      width: `${(metrics.inProgressCount / metrics.existingCount) * 100}%`,
                                    }}
                                  />
                                  <div
                                    className="bg-status-danger transition-all duration-300"
                                    style={{
                                      width: `${(metrics.inReviewCount / metrics.existingCount) * 100}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-surface-card border border-border p-2 shadow-lg">
                            <span className="text-[10px] font-medium text-foreground">
                              {metrics.breakdownText}
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>

                    {/* New Session */}
                    <td className="px-4 py-3 text-center text-xs font-semibold text-foreground">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded ${
                          metrics.newCount > 0
                            ? "bg-status-warning/10 text-status-warning"
                            : "text-foreground-muted"
                        }`}
                      >
                        {metrics.newCount}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-center text-xs font-bold text-foreground">
                      {metrics.totalCount}
                    </td>

                    {/* Editor Assigned */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {clientAssoc.map((assoc) => {
                            const p = assoc.profile as any;
                            return (
                              <TooltipProvider key={assoc.id}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Avatar className="h-6 w-6 border-2 border-surface-card shrink-0">
                                      <AvatarImage src={p?.avatar_url} alt={p?.full_name} />
                                      <AvatarFallback className="text-[8px] font-bold bg-surface-muted">
                                        {p?.full_name?.substring(0, 2).toUpperCase() || "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <span className="text-[10px] font-medium">{p?.full_name}</span>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                            >
                              <UserPlus className="h-3 w-3 text-foreground-muted" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 bg-surface-card border border-border"
                          >
                            <DropdownMenuLabel className="text-[10px] text-foreground-disabled uppercase font-medium">
                              Assign Editors
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border/60" />
                            {team.map((member) => {
                              const isAssigned = clientAssoc.some(
                                (assoc) => assoc.user_id === member.id
                              );
                              return (
                                <DropdownMenuItem
                                  key={member.id}
                                  onClick={() =>
                                    toggleEditorAssignment(client.id, member.id, isAssigned)
                                  }
                                  className="flex items-center justify-between text-xs cursor-pointer hover:bg-surface-raised/60 py-1.5"
                                >
                                  <span>{member.full_name || member.email}</span>
                                  {isAssigned && <Check className="h-3 w-3 text-primary" />}
                                </DropdownMenuItem>
                              );
                            })}
                            {team.length === 0 && (
                              <div className="text-[10px] text-foreground-disabled text-center py-2">
                                No team members found
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>

                    {/* Shoots Required */}
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-7 px-2 py-0 text-xs gap-1 opacity-95 hover:opacity-100 bg-surface-card hover:bg-surface-raised font-medium border-border/80"
                          >
                            <span>{currentShoots}</span>
                            <ChevronDown className="h-3 w-3 text-foreground-disabled shrink-0" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="bg-surface-card border border-border"
                        >
                          {[
                            "No Shoot",
                            "1 shoot",
                            "1 shoot - 2 hours",
                            "1 shoot - 4 hours",
                            "2 shoots",
                            "2 shoots - studio",
                            "2-3 shoots",
                            "3 shoots",
                            "Shoot TBD",
                            "Done",
                          ].map((option) => (
                            <DropdownMenuItem
                              key={option}
                              onClick={() => handleUpdateShoots(client.id, option, client.settings)}
                              className="text-xs cursor-pointer hover:bg-surface-raised/60 py-1"
                            >
                              <span>{option}</span>
                              {currentShoots === option && (
                                <Check className="ml-auto h-3 w-3 text-primary" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-3">
                      {editingNotesId === client.id ? (
                        <Input
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          onBlur={() => handleSaveNotes(client.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveNotes(client.id);
                            if (e.key === "Escape") setEditingNotesId(null);
                          }}
                          className="h-7 px-1.5 text-xs w-full min-w-[150px] focus-visible:ring-primary"
                          autoFocus
                        />
                      ) : (
                        <div
                          onDoubleClick={() => {
                            setNotesValue(client.notes ?? "");
                            setEditingNotesId(client.id);
                          }}
                          className="text-xs text-foreground-muted cursor-pointer truncate max-w-[200px] hover:bg-surface-raised/40 px-1 py-0.5 rounded transition-colors inline-block w-full min-h-[1.5rem]"
                          title="Double-click to edit note"
                        >
                          {client.notes || <span className="text-foreground-disabled italic">Double-click to add...</span>}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  navigate({
                                    to: clientWorkspaceBase,
                                    params: { clientSlug: client.slug ?? client.id },
                                  })
                                }
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-foreground-muted" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span className="text-[10px]">Open Workspace</span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-xs text-foreground-disabled">
                    No clients matched active filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
