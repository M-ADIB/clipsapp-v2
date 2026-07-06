/**
 * PersonProfilePage — Attio-style CRM "Source of Truth" profile.
 *
 * Layout: LEFT = tabs + content | RIGHT = always-visible sidebar
 *
 * Tabs: Overview · Activity · Deals · Calls · Emails · Company · Notes · Tasks · Files
 *
 * This component orchestrates all data hooks and delegates rendering
 * to individual tab components under ./tabs/.
 */

import { useEffect, useState } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useNavigate } from "@tanstack/react-router";
import {
  useCrmPersonById,
  useUpdateCrmPerson,
  usePersonDeals,
  usePersonCalendlyEvents,
  usePersonFollowUps,
  usePersonEmails,
  usePersonLeads,
  usePersonFormSubs,
  usePersonTasks,
  usePersonLinkedClient,
  useCrmCompany,
} from "@/hooks/data";
import { ArrowLeft, User } from "lucide-react";

import type { ProfileTab, TabDef } from "./types";
import { getInitials } from "./utils";
import { ProfileSidebar } from "./ProfileSidebar";
import { OverviewTab } from "./tabs/OverviewTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { DealsTab } from "./tabs/DealsTab";
import { CallsTab } from "./tabs/CallsTab";
import { EmailsTab } from "./tabs/EmailsTab";
import { CompanyTab } from "./tabs/CompanyTab";
import { NotesTab } from "./tabs/NotesTab";
import { TasksTab } from "./tabs/TasksTab";
import { FilesTab } from "./tabs/FilesTab";

interface PersonProfilePageProps {
  personSlug: string;
  embedded?: boolean;
}

export function PersonProfilePage({ personSlug, embedded }: PersonProfilePageProps) {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  // ── Core data ──
  const { data: person, isLoading } = useCrmPersonById(personSlug);
  const updatePerson = useUpdateCrmPerson();

  const personId = person?.id;

  // ── Related data (all hooks fire in parallel) ──
  const { data: deals = [] } = usePersonDeals(personId);
  const { data: calls = [] } = usePersonCalendlyEvents(personId);
  const { data: followUps = [] } = usePersonFollowUps(personId);
  const { data: emails = [] } = usePersonEmails(person?.email);
  const { data: leads = [] } = usePersonLeads(personId);
  const { data: formSubs = [] } = usePersonFormSubs(personId);
  const { data: tasks = [] } = usePersonTasks(personId);
  const { data: linkedClient } = usePersonLinkedClient(personId);
  const { data: company, isLoading: companyLoading } = useCrmCompany(person?.company_id);

  // ── Header ──
  useEffect(() => {
    if (!embedded) {
      setHeaderConfig({ title: person?.full_name ?? "Person", tabs: [] });
      return () => clearHeaderConfig();
    }
  }, [setHeaderConfig, clearHeaderConfig, person?.full_name, embedded]);

  // ── Navigation ──
  const handleBack = () => {
    const path = window.location.pathname;
    const rolePrefix = path.startsWith("/manager")
      ? "/manager"
      : path.startsWith("/closer")
        ? "/closer"
        : "/owner";
    navigate({ to: `${rolePrefix}/people` as string });
  };

  const handleNavigateToClient = (slug: string) => {
    const path = window.location.pathname;
    const rolePrefix = path.startsWith("/manager") ? "/manager" : "/owner";
    navigate({ to: `${rolePrefix}/clients/${slug}` as string });
  };

  const handleSaveNotes = (notes: string) => {
    if (!person) return;
    updatePerson.mutate({ id: person.id, notes });
  };

  // ── Tab definitions with live counts ──
  const tabs: TabDef[] = [
    { key: "overview", label: "Overview" },
    { key: "activity", label: "Activity" },
    { key: "deals", label: "Deals", count: deals.length },
    { key: "calls", label: "Calls", count: calls.length },
    { key: "emails", label: "Emails", count: emails.length },
    { key: "company", label: "Company", count: company ? 1 : 0 },
    { key: "notes", label: "Notes", count: person?.notes ? 1 : 0 },
    { key: "tasks", label: "Tasks", count: tasks.length },
    { key: "files", label: "Files" },
  ];

  // ── Loading ──
  if (isLoading) {
    return (
      <FullBleed>
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs text-foreground-muted">Loading contact…</p>
          </div>
        </div>
      </FullBleed>
    );
  }

  // ── Not found ──
  if (!person) {
    return (
      <FullBleed>
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <User className="h-10 w-10 text-foreground-disabled" />
            <p className="text-sm text-foreground-muted">Person not found.</p>
            <button onClick={handleBack} className="text-xs text-primary hover:underline">
              ← Back to People
            </button>
          </div>
        </div>
      </FullBleed>
    );
  }

  return (
    <FullBleed>
      {/* ── Top bar ── */}
      <div className="flex h-[45px] items-center gap-3 border-b border-border px-4 md:h-[52px]">
        <button
          onClick={handleBack}
          className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-surface-raised"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
            {getInitials(person.full_name)}
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground-strong">{person.full_name}</h1>
            {person.job_title && (
              <p className="text-[10px] text-foreground-muted">{person.job_title}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Main layout: LEFT tabs + content | RIGHT sidebar ── */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* ── LEFT: Tabs + Content ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex h-[38px] items-center gap-0 overflow-x-auto border-b border-border px-2 md:h-[42px]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex h-full shrink-0 items-center gap-1.5 px-3 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-primary"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold ${
                      activeTab === tab.key
                        ? "bg-primary/15 text-primary"
                        : "bg-surface-raised text-foreground-disabled"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "overview" && (
              <OverviewTab
                person={person}
                dealsCount={deals.length}
                callsCount={calls.length}
                emailsCount={emails.length}
              />
            )}
            {activeTab === "activity" && (
              <ActivityTab
                personName={person.full_name}
                createdAt={person.created_at}
                deals={deals}
                calls={calls}
                followUps={followUps}
                formSubs={formSubs}
                leads={leads}
              />
            )}
            {activeTab === "deals" && <DealsTab deals={deals} />}
            {activeTab === "calls" && <CallsTab calls={calls} />}
            {activeTab === "emails" && <EmailsTab emails={emails} />}
            {activeTab === "company" && (
              <CompanyTab
                company={company}
                isLoading={companyLoading}
                companyName={person.company_name}
              />
            )}
            {activeTab === "notes" && (
              <NotesTab
                notes={person.notes}
                description={person.description}
                onSave={handleSaveNotes}
                isSaving={updatePerson.isPending}
              />
            )}
            {activeTab === "tasks" && <TasksTab tasks={tasks} />}
            {activeTab === "files" && <FilesTab />}
          </div>
        </div>

        {/* ── RIGHT: Always-visible sidebar ── */}
        <div className="w-full shrink-0 border-t border-border lg:w-[300px] lg:border-l lg:border-t-0">
          <ProfileSidebar
            person={person}
            linkedClient={linkedClient}
            onNavigateToClient={handleNavigateToClient}
          />
        </div>
      </div>
    </FullBleed>
  );
}
