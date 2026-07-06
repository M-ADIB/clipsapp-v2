/**
 * ClientDashboard — Client home page matching the legacy layout.
 *
 * Layout:
 *   1. Production  — full-width 5-card row (Total, In Progress, Review, Scheduled, Posted)
 *   2. Middle row  — What's Next (3fr) + Priority Alerts (2fr)
 *   3. Your Plans  — project cards grid below
 *
 * Header tabs: Dashboard | Journey | Billing
 */
import { useEffect, useState, useMemo } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { usePipelineStats, useClientProjects } from "@/hooks/use-client-dashboard";
import { CheckCircle2, FileText, FolderOpen, ArrowUpRight, Sparkles, X } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";

import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { TaskCard, ProjectCard } from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TabPanel } from "@/components/ui/tab-panel";
import { JourneyTab } from "@/components/dashboards/owner/workspace/JourneyTab";
import { ClientBillingTab } from "@/components/dashboards/owner/finance/ClientBillingTab";
import { useClientJourney } from "@/hooks/data";
import { useClientFoundationReady, useMyClientIds } from "@/hooks/use-clients";

/* ------------------------------------------------------------------ */
/* Hook: fetch client's primary client_id from client_access          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Sub-component: VideoStatCard                                        */
/* ------------------------------------------------------------------ */

/**
 * Injects the snake-spin keyframes once into the document head.
 * Safe to call multiple times — only one <style> tag is created.
 */
function ensureSnakeKeyframes() {
  const id = "clips-snake-glow-kf";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    @keyframes clips-snake-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes clips-shine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;
  document.head.appendChild(style);
}

interface VideoStatCardProps {
  label: string;
  count: number;
  /** If set, card navigates to /client/videos?status=<slug> on click */
  statusSlug?: string;
  /** Show the upward arrow icon */
  showArrow?: boolean;
  /** Animate a glowing snake border (used for Review when count > 0) */
  glow?: boolean;
}

function VideoStatCard({ label, count, statusSlug, showArrow, glow }: VideoStatCardProps) {
  const navigate = useNavigate();

  // Inject keyframes on first render
  if (glow && count > 0) ensureSnakeKeyframes();

  const isGlowing = glow && count > 0;

  const inner = (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl bg-surface-card p-4 md:p-5 h-full",
        statusSlug &&
          !isGlowing &&
          "cursor-pointer transition-all duration-300 hover:bg-surface-card-2",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground-muted">{label}</span>
        {showArrow && <ArrowUpRight className="h-3.5 w-3.5 text-foreground-disabled" />}
      </div>
      <p className="mt-2 font-display text-[36px] md:text-[42px] font-medium leading-none tracking-tight text-foreground-strong">
        {count}
      </p>
      <div className="mt-4 h-[3px] w-8 rounded-full bg-primary" />
    </div>
  );

  if (isGlowing) {
    // Snake / conic-gradient animated border wrapper
    return (
      <div
        onClick={() =>
          statusSlug && navigate({ to: "/client/videos", search: { status: statusSlug } })
        }
        style={{
          position: "relative",
          borderRadius: "0.75rem",
          padding: "1.5px",
          overflow: "hidden",
        }}
        className="group transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_30px_-5px_color-mix(in_oklab,var(--primary)_30%,transparent)] cursor-pointer"
        role={statusSlug ? "button" : undefined}
        aria-label={statusSlug ? `Filter videos by ${label}` : undefined}
        tabIndex={statusSlug ? 0 : undefined}
        onKeyDown={(e) =>
          statusSlug &&
          (e.key === "Enter" || e.key === " ") &&
          navigate({ to: "/client/videos", search: { status: statusSlug } })
        }
      >
        {/* Rotating snake background */}
        <div
          className="absolute inset-[-100%] animate-[clips-snake-spin_8s_linear_infinite]"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 50%, var(--primary-glow) 80%, var(--primary) 100%)",
          }}
        />
        {/* Inner Card content container */}
        <div className="relative rounded-[11px] bg-surface-card p-4 md:p-5 h-full flex flex-col justify-between overflow-hidden z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-muted">{label}</span>
            {showArrow && <ArrowUpRight className="h-3.5 w-3.5 text-foreground-disabled" />}
          </div>
          <p className="mt-2 font-display text-[36px] md:text-[42px] font-medium leading-none tracking-tight text-foreground-strong">
            {count}
          </p>
          <div className="mt-4 h-[3px] w-8 rounded-full bg-primary" />

          {/* Metallic shine overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[11px] z-20">
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:animate-[clips-shine_1.8s_cubic-bezier(0.16,1,0.3,1)_1] transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(115deg, transparent 35%, rgba(255, 255, 255, 0.02) 45%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.02) 55%, transparent 65%)",
                transform: "translateX(-100%)",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (statusSlug) {
    return (
      <div
        className="rounded-xl border border-border"
        onClick={() => navigate({ to: "/client/videos", search: { status: statusSlug } })}
        role="button"
        aria-label={`Filter videos by ${label}`}
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") &&
          navigate({ to: "/client/videos", search: { status: statusSlug } })
        }
      >
        {inner}
      </div>
    );
  }

  return <div className="rounded-xl border border-border">{inner}</div>;
}

/* ------------------------------------------------------------------ */
/* Page Component                                                      */
/* ------------------------------------------------------------------ */

export function ClientDashboard() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const [activeTab, setActiveTabState] = useState<string>("dashboard");
  const navigate = useNavigate();

  /* data */
  const { data: clientIds = [], isLoading: accessLoading } = useMyClientIds();
  const clientId = clientIds[0];
  const { data: pipeline, isLoading: pipelineLoading } = usePipelineStats(clientId);
  const { data: journeySteps = [], isLoading: journeyLoading } = useClientJourney(clientId);
  const { data: projects = [], isLoading: projectsLoading } = useClientProjects(clientId);

  const { isReady: isFoundationReady } = useClientFoundationReady();
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);

  useEffect(() => {
    if (clientId) {
      setDismissedOnboarding(localStorage.getItem(`dismissed_onboarding_${clientId}`) === "true");
    }
  }, [clientId]);

  const actionsLoading = journeyLoading;

  const activeJourneySteps = useMemo(() => {
    return journeySteps.filter((s) => s.status !== "completed").slice(0, 6);
  }, [journeySteps]);

  const totalSteps = journeySteps.length;
  const completedSteps = useMemo(
    () => journeySteps.filter((s) => s.status === "completed").length,
    [journeySteps],
  );
  const progressPct = totalSteps === 0 ? 100 : Math.round((completedSteps / totalSteps) * 100);

  useEffect(() => {
    setHeaderConfig({
      title: "Dashboard",
      tabs: [
        { key: "dashboard", label: "Dashboard" },
        { key: "journey", label: "Journey" },
        { key: "billing", label: "Billing" },
      ],
      activeTab,
      onTabChange: (key: string) => setActiveTabState(key),
    });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig, activeTab]);

  /* loading skeleton */
  if (accessLoading) {
    return (
      <FullBleed>
        <div className="flex flex-col gap-6 px-3 py-5 md:px-5 md:py-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[3fr_2fr]">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </FullBleed>
    );
  }

  /* no workspace */
  if (!clientId) {
    return (
      <FullBleed>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-2xl bg-surface-card p-6 mb-4">
            <FolderOpen className="h-10 w-10 text-foreground-disabled" />
          </div>
          <p className="text-sm text-foreground-muted">
            Your workspace is being set up. Please contact your account manager.
          </p>
        </div>
      </FullBleed>
    );
  }

  return (
    <FullBleed>
      <div className="flex flex-col px-3 py-5 md:px-5 md:py-6 gap-7 pb-24">
        <TabPanel active={activeTab === "dashboard"}>
          <div className="flex flex-col gap-7">
            {/* ═══════════════════════════════════════════════════════ */}
            {/* 1. PRODUCTION — 5 stat cards in a horizontal row       */}
            {/* ═══════════════════════════════════════════════════════ */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-foreground-strong">
                  Production
                </h2>
                <Link
                  to="/client/videos"
                  className="rounded-full border border-border bg-surface-card px-4 py-1.5 text-[13px] font-medium text-foreground-strong transition-colors hover:bg-surface-card-2"
                >
                  View All Videos
                </Link>
              </div>

              {pipelineLoading ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  <VideoStatCard
                    label="Total Videos"
                    count={pipeline?.total ?? 0}
                    statusSlug="all"
                  />
                  <VideoStatCard
                    label="In Progress"
                    count={pipeline?.in_progress ?? 0}
                    statusSlug="in_progress"
                  />
                  <VideoStatCard
                    label="Review"
                    count={pipeline?.review ?? 0}
                    statusSlug="review"
                    showArrow
                    glow
                  />
                  <VideoStatCard
                    label="Scheduled"
                    count={pipeline?.scheduled ?? 0}
                    statusSlug="scheduled"
                  />
                  <VideoStatCard label="Posted" count={pipeline?.posted ?? 0} statusSlug="posted" />
                </div>
              )}
            </section>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* 2. MIDDLE ROW — What's Next (3fr) + Priority Alerts    */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[3fr_2fr]">
              {/* What's Next */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold text-foreground-strong">
                    What's Next
                  </h2>
                  {!actionsLoading && (
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className="h-full rounded-full bg-[color:var(--status-success)] transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-xs text-foreground-muted">
                        {completedSteps}/{totalSteps}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 rounded-xl border border-border bg-surface-card p-5">
                  {actionsLoading ? (
                    <div className="flex flex-col gap-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-[72px] rounded-lg" />
                      ))}
                    </div>
                  ) : activeJourneySteps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[color:var(--status-success)] bg-[rgba(32,201,51,0.1)]">
                        <CheckCircle2 className="h-6 w-6 text-[color:var(--status-success)]" />
                      </div>
                      <p className="font-display text-base font-semibold text-[color:var(--status-success)]">
                        Journey Complete!
                      </p>
                      <p className="mt-1.5 text-sm text-foreground-muted">
                        You've completed your current pipeline. Ready for another round?
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {activeJourneySteps.map((step) => {
                        const desc =
                          (step.metadata as Record<string, string> | null)?.description ?? "";
                        return (
                          <TaskCard
                            key={step.id}
                            title={step.step_label}
                            badgeLabel={step.status === "in_progress" ? "IN PROGRESS" : "UPCOMING"}
                            badgeColor={step.status === "in_progress" ? "warning" : "info"}
                            description={desc || "This step is part of your journey."}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              {/* Priority Alerts */}
              <section className="flex flex-col gap-3">
                <h2 className="font-display text-xl font-semibold text-foreground-strong">
                  Priority Alerts
                </h2>
                <div className="flex-1 rounded-xl border border-border bg-surface-card p-5">
                  <div className="flex h-full min-h-[160px] items-center justify-center">
                    <p className="text-sm text-foreground-muted">
                      No alerts right now. You're all caught up! 🎉
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* 3. YOUR PLANS — project cards                          */}
            {/* ═══════════════════════════════════════════════════════ */}
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-foreground-strong">
                Your Plans
              </h2>

              {projectsLoading ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-44 rounded-xl" />
                </div>
              ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-card py-12 text-center">
                  <FileText className="mb-3 h-10 w-10 text-foreground-disabled" />
                  <p className="text-sm text-foreground-muted">No active projects yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((proj) => {
                    const progress = Number(proj.progress ?? 0);
                    const startedLabel = proj.start_date
                      ? `Started ${new Date(proj.start_date).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}`
                      : "No start date";

                    return (
                      <ProjectCard
                        key={proj.id}
                        name={proj.project_name}
                        startedAt={startedLabel}
                        team={[]}
                        extraMembers={0}
                        percent={progress}
                        progressValue={`${proj.videos_completed ?? 0}/${proj.video_count ?? 0} videos`}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </TabPanel>

        <TabPanel active={activeTab === "journey"} lazy>
          <JourneyTab clientId={clientId} readOnly={true} />
        </TabPanel>

        <TabPanel active={activeTab === "billing"} lazy>
          <ClientBillingTab clientId={clientId} readOnly={true} />
        </TabPanel>
      </div>

      {/* Floating Onboarding Toast/Message */}
      {!dismissedOnboarding && isFoundationReady && (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 max-w-sm rounded-2xl border border-primary bg-surface-card/90 backdrop-blur-md p-4 shadow-[0_12px_40px_-12px_rgba(var(--primary-rgb),0.3)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h4 className="text-xs font-semibold text-foreground-strong">
                  Content Studio Activated!
                </h4>
                <button
                  onClick={() => {
                    localStorage.setItem(`dismissed_onboarding_${clientId}`, "true");
                    setDismissedOnboarding(true);
                  }}
                  className="text-foreground-disabled hover:text-foreground p-0.5 rounded transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-foreground-muted mt-1 leading-relaxed">
                Click here to view your Content Studio, answer onboarding questions, and view your
                strategy.
              </p>
              <div className="mt-2.5 flex justify-end">
                <button
                  onClick={() => {
                    navigate({ to: "/client/studio" });
                  }}
                  className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Go to Studio
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </FullBleed>
  );
}
