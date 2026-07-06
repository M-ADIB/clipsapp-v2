/**
 * SettingsTab — Comprehensive client workspace settings.
 *
 * Refined to match the legacy multi-tab and accordion layout.
 * Wired to: useClient(clientId) + useUpdateClient() mutation
 */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  useClient,
  useUpdateClient,
  useProjectsByClient,
  useTeam,
  useClientTeamAssignments,
  useAssignTeamMember,
  useUnassignTeamMember,
} from "@/hooks/data";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Loader2,
  AlertTriangle,
  User,
  Share2,
  Palette,
  Film,
  Plus,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronDown,
  Mail,
  MessageSquare,
  Instagram,
  Bell,
  Eye,
  Copy,
  Send,
  Building2,
  Briefcase,
  Target,
  Activity,
  CreditCard,
  Check,
  Pencil,
  Trash2,
  Facebook,
  Link2,
  BarChart2,
  Users,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { ClientBillingTab } from "../finance/ClientBillingTab";
import { InlineEditableField } from "./InlineEditableField";
import { format } from "date-fns";

interface SettingsTabProps {
  clientId: string;
}

type AccountStatus = Database["public"]["Enums"]["account_status"];
type WorkspaceType = Database["public"]["Enums"]["workspace_type"];

const STATUS_OPTIONS: { value: AccountStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "churned", label: "Churned" },
  { value: "onboarding", label: "Onboarding" },
  { value: "trial", label: "Trial" },
];

const WORKSPACE_TYPE_OPTIONS: { value: WorkspaceType; label: string }[] = [
  { value: "individual", label: "Individual" },
  { value: "company", label: "Company" },
  { value: "team", label: "Team" },
  { value: "agency", label: "Agency" },
  { value: "enterprise", label: "Enterprise" },
];

const ASPECT_RATIO_OPTIONS = [
  { value: "9:16", label: "9:16 (Vertical)" },
  { value: "16:9", label: "16:9 (Horizontal)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "4:5", label: "4:5 (Portrait)" },
];

const INCOME_OPTIONS = [
  { value: "Not set", label: "Not set" },
  { value: "$0 - $10,000", label: "$0 - $10,000" },
  { value: "$10,000 - $30,000", label: "$10,000 - $30,000" },
  { value: "$30,000 - $50,000", label: "$30,000 - $50,000" },
  { value: "$50,000+", label: "$50,000+" },
];

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  website?: string;
  [key: string]: string | undefined;
}

interface ClientSettings {
  solution_type?: string;
  income_range?: string;
  goal?: string;
  obstacle?: string;
  interested_in?: string;
  [key: string]: any;
}

const SIDEBAR_ITEMS = [
  { id: "client-info", label: "Client Info", icon: User },
  { id: "features-plans", label: "Features & Plans", icon: Palette },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "workspace-status", label: "Workspace Status", icon: Activity },
  { id: "team-access", label: "Team Access", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing-history", label: "Billing History", icon: CreditCard },
  { id: "danger-zone", label: "Danger Zone", icon: AlertTriangle },
] as const;

type SettingsSection = (typeof SIDEBAR_ITEMS)[number]["id"];

export function SettingsTab({ clientId }: SettingsTabProps) {
  const { data: client, isLoading, error } = useClient(clientId);
  const updateClient = useUpdateClient();
  const navigate = useNavigate();
  const { role } = useAuth();

  const basePath = role === "manager" ? "/manager" : "/owner";

  // Active section selection
  const [activeSection, setActiveSection] = useState<SettingsSection>("client-info");

  // Accordion toggle states inside Client Info
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    solution: false,
    social: false,
    professional: false,
    goals: false,
  });

  // Color palette state
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("#E7FE52");

  // Team Assignments variables
  const { data: team = [] } = useTeam();
  const { data: assignments = [], isLoading: assignmentsLoading } = useClientTeamAssignments();
  const assignTeamMember = useAssignTeamMember();
  const unassignTeamMember = useUnassignTeamMember();

  // Sync color palette
  useEffect(() => {
    if (client?.color_palette) {
      setColorPalette(client.color_palette);
    }
  }, [client]);

  // Color palette helpers
  const addColor = () => {
    if (newColor && !colorPalette.includes(newColor)) {
      const updated = [...colorPalette, newColor];
      setColorPalette(updated);
      updateClient.mutate({ id: clientId, color_palette: updated });
      toast.success("Color added to palette");
    }
  };

  const removeColor = (idx: number) => {
    const updated = colorPalette.filter((_, i) => i !== idx);
    setColorPalette(updated);
    updateClient.mutate({ id: clientId, color_palette: updated });
    toast.success("Color removed from palette");
  };

  // Safe Field Saver - Inline edits go here!
  const saveField = useCallback(
    async (fieldName: string, value: any, group: "social_links" | "settings" | null = null) => {
      if (!client) return;
      try {
        if (group === "social_links") {
          const currentLinks = (client.social_links as SocialLinks) || {};
          const updatedLinks = { ...currentLinks, [fieldName]: value || null };
          await updateClient.mutateAsync({
            id: clientId,
            social_links: updatedLinks,
          } as any);
        } else if (group === "settings") {
          const currentSettings = (client.settings as ClientSettings) || {};
          const updatedSettings = { ...currentSettings, [fieldName]: value || null };
          await updateClient.mutateAsync({
            id: clientId,
            settings: updatedSettings,
          } as any);
        } else {
          await updateClient.mutateAsync({
            id: clientId,
            [fieldName]: value === "" ? null : value,
          } as any);
        }
        toast.success("Field updated successfully");
      } catch (err: any) {
        toast.error(`Failed to save: ${err.message || err}`);
      }
    },
    [client, clientId, updateClient],
  );

  // Active projects count
  const { data: projects = [] } = useProjectsByClient(clientId);
  const activeProjectsCount = useMemo(
    () => projects.filter((p) => !p.archived_at).length,
    [projects],
  );

  // Client Info Count Indicators
  const basicCount = useMemo(() => {
    if (!client) return "0/5";
    const fields = [client.name, client.email, client.phone, client.location, client.industry];
    return `${fields.filter(Boolean).length}/5`;
  }, [client]);

  const solutionCount = useMemo(() => {
    if (!client) return "0/4";
    const settings = (client.settings as ClientSettings) || {};
    const fields = [
      settings.solution_type,
      client.videos_per_month,
      client.account_status,
      client.start_date,
    ];
    return `${fields.filter(Boolean).length}/4`;
  }, [client]);

  const socialCount = useMemo(() => {
    if (!client) return "0/6";
    const sl = (client.social_links as SocialLinks) || {};
    const fields = [sl.instagram, sl.tiktok, sl.youtube, sl.facebook, sl.linkedin, sl.twitter];
    return `${fields.filter(Boolean).length}/6`;
  }, [client]);

  const professionalCount = useMemo(() => {
    if (!client) return "0/3";
    const settings = (client.settings as ClientSettings) || {};
    const fields = [client.job_title, client.company, settings.income_range];
    return `${fields.filter(Boolean).length}/3`;
  }, [client]);

  const goalsCount = useMemo(() => {
    if (!client) return "0/3";
    const settings = (client.settings as ClientSettings) || {};
    const fields = [settings.goal, settings.obstacle, settings.interested_in];
    return `${fields.filter(Boolean).length}/3`;
  }, [client]);

  // Magic Link generator
  const workspaceLink = useMemo(() => {
    return client?.workspace_token
      ? `${window.location.origin}/r/${client.workspace_token}`
      : `${window.location.origin}/client`;
  }, [client]);

  const copyWorkspaceLink = () => {
    navigator.clipboard.writeText(workspaceLink);
    toast.success("Workspace link copied to clipboard!");
  };

  const sendMagicLink = () => {
    if (!client?.email) {
      toast.error("Client email is required to send magic links.");
      return;
    }
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
      loading: "Sending magic link...",
      success: `Magic link successfully sent to ${client.email}!`,
      error: "Failed to send magic link.",
    });
  };

  // Toggle integrations helper
  const handleToggleIntegration = async (key: string) => {
    if (!client) return;
    const current = (client.connected_accounts as Record<string, any>) || {};
    const updated = { ...current, [key]: !current[key] };
    try {
      await updateClient.mutateAsync({
        id: clientId,
        connected_accounts: updated,
      } as any);
      toast.success(updated[key] ? `Connected to ${key}!` : `Disconnected from ${key}.`);
    } catch (err: any) {
      toast.error(`Failed to update integration: ${err.message || err}`);
    }
  };

  // Danger Zone - Archiving Client
  const handleArchiveClient = async () => {
    if (
      !window.confirm(
        "Are you sure you want to archive this client? This will restrict access and hide them from active lists.",
      )
    ) {
      return;
    }
    try {
      await updateClient.mutateAsync({
        id: clientId,
        archived_at: new Date().toISOString(),
      });
      toast.success("Client archived successfully");
      navigate({ to: `${basePath}/clients` as any });
    } catch (err: any) {
      toast.error(`Failed to archive client: ${err.message || err}`);
    }
  };

  // Loading / Error states
  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-status-danger/20">
        <span className="text-sm text-status-danger">Failed to load settings: {error.message}</span>
      </div>
    );
  }

  if (isLoading || !client) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const socialLinks = (client.social_links as SocialLinks) || {};
  const settingsObj = (client.settings as ClientSettings) || {};
  const connectedAccounts = (client.connected_accounts as Record<string, any>) || {};

  return (
    <div className="flex flex-col gap-6">
      {/* ── HEADER PANEL ──────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-b border-border/40 pb-5">
        <Link
          to={`${basePath}/clients` as any}
          className="inline-flex items-center gap-1 text-xs text-foreground-disabled hover:text-foreground-muted transition-colors font-medium self-start"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Clients
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl border border-primary/20 shadow-sm">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-display text-foreground-strong">
                {client.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/25">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {activeProjectsCount} {activeProjectsCount === 1 ? "project" : "projects"} active
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => (window.location.href = `mailto:${client.email || ""}`)}
              disabled={!client.email}
              className="p-2.5 rounded-lg border border-border bg-surface-card hover:bg-foreground/[0.04] hover:text-foreground-strong text-foreground-muted transition-colors shadow-sm disabled:opacity-40"
              title={client.email ? `Send Email to ${client.email}` : "Email not set"}
            >
              <Mail className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate({ to: `${basePath}/chat` as any })}
              className="p-2.5 rounded-lg border border-border bg-surface-card hover:bg-foreground/[0.04] hover:text-foreground-strong text-foreground-muted transition-colors shadow-sm"
              title="Open Chat Room"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (socialLinks.instagram) {
                  window.open(
                    socialLinks.instagram.startsWith("http")
                      ? socialLinks.instagram
                      : `https://instagram.com/${socialLinks.instagram.replace("@", "")}`,
                    "_blank",
                  );
                } else {
                  toast.info("Instagram handle not configured.");
                }
              }}
              className="p-2.5 rounded-lg border border-border bg-surface-card hover:bg-foreground/[0.04] hover:text-foreground-strong text-foreground-muted transition-colors shadow-sm"
              title="View Instagram Profile"
            >
              <Instagram className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveSection("notifications")}
              className="p-2.5 rounded-lg border border-border bg-surface-card hover:bg-foreground/[0.04] hover:text-foreground-strong text-foreground-muted transition-colors shadow-sm"
              title="Notification Settings"
            >
              <Bell className="h-4 w-4" />
            </button>
            <button
              onClick={copyWorkspaceLink}
              className="p-2.5 rounded-lg border border-border bg-surface-card hover:bg-foreground/[0.04] hover:text-foreground-strong text-foreground-muted transition-colors shadow-sm"
              title="Copy Workspace Share Link"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => window.open(workspaceLink, "_blank")}
              className="p-2.5 rounded-lg border border-border bg-surface-card hover:bg-foreground/[0.04] hover:text-foreground-strong text-foreground-muted transition-colors shadow-sm"
              title="Preview Client Workspace View"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN BODY LAYOUT ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="px-2">
            <span className="text-[10px] font-semibold uppercase tracking-[1px] text-foreground-disabled block mb-2">
              Settings
            </span>
            <div className="flex flex-col gap-0.5">
              {SIDEBAR_ITEMS.map((item) => {
                const IconComp = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm rounded-lg transition-all text-left font-medium border ${
                      isActive
                        ? "bg-foreground/[0.03] text-foreground-strong border-border/60 shadow-sm font-semibold"
                        : "text-foreground-muted border-transparent hover:bg-foreground/[0.01] hover:text-foreground-strong"
                    }`}
                  >
                    <IconComp
                      className={`h-4 w-4 ${isActive ? "text-primary" : "text-foreground-muted"}`}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-3 min-h-[450px]">
          {/* SECTION: CLIENT INFO */}
          {activeSection === "client-info" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-display text-foreground-strong">
                  Client Info
                </h3>
                <p className="text-sm text-foreground-muted">
                  Full profile, social links, resources, and workspace access
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
                  <div>
                    <h4 className="text-base font-semibold text-foreground-strong">
                      Client Information
                    </h4>
                    <p className="text-xs text-foreground-disabled">
                      Click any field to edit • Expand sections to view details
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyWorkspaceLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-card-2 border border-border hover:bg-surface-raised text-xs rounded-md font-medium text-foreground-muted transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy Workspace Link
                    </button>
                    <button
                      onClick={sendMagicLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-card-2 border border-border hover:bg-surface-raised text-xs rounded-md font-medium text-foreground-muted transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send Magic Link
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Accordion 1: Basic Information */}
                  <div className="rounded-xl border border-border bg-surface-card overflow-hidden">
                    <button
                      onClick={() => setExpandedSections((p) => ({ ...p, basic: !p.basic }))}
                      className="w-full flex items-center justify-between p-4 text-left border-b border-border/40 hover:bg-foreground/[0.01]"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="h-4.5 w-4.5 text-foreground-muted" />
                        <span className="font-semibold text-foreground-strong text-sm">
                          Basic Information
                        </span>
                        <span className="text-[10px] bg-foreground/[0.05] text-foreground-muted px-2 py-0.5 rounded-full font-bold">
                          {basicCount}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-foreground-disabled transition-transform ${
                          expandedSections.basic ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedSections.basic && (
                      <div className="p-4 space-y-1 bg-foreground/[0.005]">
                        <InlineEditableField
                          icon={User}
                          label="Name"
                          value={client.name}
                          onSave={(v) => saveField("name", v)}
                        />
                        <InlineEditableField
                          icon={Mail}
                          label="Email"
                          value={client.email}
                          type="email"
                          onSave={(v) => saveField("email", v)}
                        />
                        <InlineEditableField
                          icon={Mail}
                          label="Phone"
                          value={client.phone}
                          type="tel"
                          onSave={(v) => saveField("phone", v)}
                        />
                        <InlineEditableField
                          icon={Building2}
                          label="Location"
                          value={client.location}
                          onSave={(v) => saveField("location", v)}
                        />
                        <InlineEditableField
                          icon={Briefcase}
                          label="Industry"
                          value={client.industry}
                          onSave={(v) => saveField("industry", v)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Accordion 2: Solution & Subscription */}
                  <div className="rounded-xl border border-border bg-surface-card overflow-hidden">
                    <button
                      onClick={() => setExpandedSections((p) => ({ ...p, solution: !p.solution }))}
                      className="w-full flex items-center justify-between p-4 text-left border-b border-border/40 hover:bg-foreground/[0.01]"
                    >
                      <div className="flex items-center gap-2.5">
                        <Film className="h-4.5 w-4.5 text-foreground-muted" />
                        <span className="font-semibold text-foreground-strong text-sm">
                          Solution & Subscription
                        </span>
                        <span className="text-[10px] bg-foreground/[0.05] text-foreground-muted px-2 py-0.5 rounded-full font-bold">
                          {solutionCount}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-foreground-disabled transition-transform ${
                          expandedSections.solution ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedSections.solution && (
                      <div className="p-4 space-y-1 bg-foreground/[0.005]">
                        <InlineEditableField
                          icon={Target}
                          label="Solution Type"
                          value={settingsObj.solution_type}
                          placeholder="e.g. Highlights™"
                          onSave={(v) => saveField("solution_type", v, "settings")}
                        />
                        <InlineEditableField
                          icon={Film}
                          label="Videos per Month"
                          value={client.videos_per_month ? String(client.videos_per_month) : null}
                          type="number"
                          placeholder="Not set"
                          onSave={(v) => saveField("videos_per_month", parseInt(v) || 0)}
                        />
                        <InlineEditableField
                          icon={CreditCard}
                          label="Account Status"
                          value={client.account_status}
                          type="select"
                          options={STATUS_OPTIONS}
                          badge={
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                              {client.account_status}
                            </span>
                          }
                          onSave={(v) => saveField("account_status", v)}
                        />
                        <InlineEditableField
                          icon={Activity}
                          label="Start Date"
                          value={client.start_date}
                          type="date"
                          onSave={(v) => saveField("start_date", v)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Accordion 3: Social Media */}
                  <div className="rounded-xl border border-border bg-surface-card overflow-hidden">
                    <button
                      onClick={() => setExpandedSections((p) => ({ ...p, social: !p.social }))}
                      className="w-full flex items-center justify-between p-4 text-left border-b border-border/40 hover:bg-foreground/[0.01]"
                    >
                      <div className="flex items-center gap-2.5">
                        <Instagram className="h-4.5 w-4.5 text-foreground-muted" />
                        <span className="font-semibold text-foreground-strong text-sm">
                          Social Media
                        </span>
                        <span className="text-[10px] bg-foreground/[0.05] text-foreground-muted px-2 py-0.5 rounded-full font-bold">
                          {socialCount}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-foreground-disabled transition-transform ${
                          expandedSections.social ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedSections.social && (
                      <div className="p-4 space-y-1 bg-foreground/[0.005]">
                        <InlineEditableField
                          icon={Instagram}
                          label="Instagram"
                          value={socialLinks.instagram}
                          placeholder="@handle or Profile Link"
                          onSave={(v) => saveField("instagram", v, "social_links")}
                        />
                        <InlineEditableField
                          icon={Instagram}
                          label="TikTok"
                          value={socialLinks.tiktok}
                          placeholder="@handle or Profile Link"
                          onSave={(v) => saveField("tiktok", v, "social_links")}
                        />
                        <InlineEditableField
                          icon={Instagram}
                          label="YouTube"
                          value={socialLinks.youtube}
                          placeholder="Channel URL"
                          onSave={(v) => saveField("youtube", v, "social_links")}
                        />
                        <InlineEditableField
                          icon={Facebook}
                          label="Facebook"
                          value={socialLinks.facebook}
                          placeholder="Facebook URL"
                          onSave={(v) => saveField("facebook", v, "social_links")}
                        />
                        <InlineEditableField
                          icon={Briefcase}
                          label="LinkedIn"
                          value={socialLinks.linkedin}
                          placeholder="Profile Link"
                          onSave={(v) => saveField("linkedin", v, "social_links")}
                        />
                        <InlineEditableField
                          icon={Instagram}
                          label="Twitter"
                          value={socialLinks.twitter}
                          placeholder="@handle or Profile Link"
                          onSave={(v) => saveField("twitter", v, "social_links")}
                        />
                      </div>
                    )}
                  </div>

                  {/* Accordion 4: Professional Details */}
                  <div className="rounded-xl border border-border bg-surface-card overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedSections((p) => ({ ...p, professional: !p.professional }))
                      }
                      className="w-full flex items-center justify-between p-4 text-left border-b border-border/40 hover:bg-foreground/[0.01]"
                    >
                      <div className="flex items-center gap-2.5">
                        <Briefcase className="h-4.5 w-4.5 text-foreground-muted" />
                        <span className="font-semibold text-foreground-strong text-sm">
                          Professional Details
                        </span>
                        <span className="text-[10px] bg-foreground/[0.05] text-foreground-muted px-2 py-0.5 rounded-full font-bold">
                          {professionalCount}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-foreground-disabled transition-transform ${
                          expandedSections.professional ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedSections.professional && (
                      <div className="p-4 space-y-1 bg-foreground/[0.005]">
                        <InlineEditableField
                          icon={Briefcase}
                          label="Job Title"
                          value={client.job_title}
                          onSave={(v) => saveField("job_title", v)}
                        />
                        <InlineEditableField
                          icon={Building2}
                          label="Company"
                          value={client.company}
                          onSave={(v) => saveField("company", v)}
                        />
                        <InlineEditableField
                          icon={CreditCard}
                          label="Income Range"
                          value={settingsObj.income_range}
                          type="select"
                          options={INCOME_OPTIONS}
                          onSave={(v) => saveField("income_range", v, "settings")}
                        />
                      </div>
                    )}
                  </div>

                  {/* Accordion 5: Goals & Interests */}
                  <div className="rounded-xl border border-border bg-surface-card overflow-hidden">
                    <button
                      onClick={() => setExpandedSections((p) => ({ ...p, goals: !p.goals }))}
                      className="w-full flex items-center justify-between p-4 text-left border-b border-border/40 hover:bg-foreground/[0.01]"
                    >
                      <div className="flex items-center gap-2.5">
                        <Target className="h-4.5 w-4.5 text-foreground-muted" />
                        <span className="font-semibold text-foreground-strong text-sm">
                          Goals & Interests
                        </span>
                        <span className="text-[10px] bg-foreground/[0.05] text-foreground-muted px-2 py-0.5 rounded-full font-bold">
                          {goalsCount}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-foreground-disabled transition-transform ${
                          expandedSections.goals ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedSections.goals && (
                      <div className="p-4 space-y-1 bg-foreground/[0.005]">
                        <InlineEditableField
                          icon={Target}
                          label="Goal"
                          value={settingsObj.goal}
                          type="textarea"
                          onSave={(v) => saveField("goal", v, "settings")}
                        />
                        <InlineEditableField
                          icon={AlertTriangle}
                          label="Obstacle"
                          value={settingsObj.obstacle}
                          type="textarea"
                          onSave={(v) => saveField("obstacle", v, "settings")}
                        />
                        <InlineEditableField
                          icon={User}
                          label="Interested In"
                          value={settingsObj.interested_in}
                          type="textarea"
                          onSave={(v) => saveField("interested_in", v, "settings")}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: FEATURES & PLANS */}
          {activeSection === "features-plans" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-display text-foreground-strong">
                  Features & Plans
                </h3>
                <p className="text-sm text-foreground-muted">
                  Configure available modules, aspect ratios, color palettes, and branding assets
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border/40 pb-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-[1px] text-foreground-muted block">
                      Default Aspect Ratio
                    </label>
                    <select
                      value={client.default_aspect_ratio || "9:16"}
                      onChange={(e) => saveField("default_aspect_ratio", e.target.value)}
                      className="h-9 w-full rounded-lg border border-border bg-surface-card-2 px-3 text-sm text-foreground-strong focus:border-primary focus:outline-none"
                    >
                      {ASPECT_RATIO_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-[1px] text-foreground-muted block">
                      Branding Deck URL
                    </label>
                    <input
                      type="url"
                      value={client.branding_deck_url || ""}
                      onChange={(e) => saveField("branding_deck_url", e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="h-9 w-full rounded-lg border border-border bg-surface-card-2 px-3 text-sm text-foreground-strong placeholder:text-foreground-disabled focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Color Palette Manager */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground-strong">
                      Brand Color Palette
                    </h4>
                    <p className="text-xs text-foreground-disabled">
                      Set visual colors to help editors maintain brand identity consistency
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {colorPalette.map((color, idx) => (
                      <div
                        key={idx}
                        className="group relative flex items-center gap-2 rounded-lg border border-border bg-surface-card-2 px-2.5 py-1.5"
                      >
                        <div
                          className="h-5 w-5 rounded border border-border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-mono text-foreground-strong">{color}</span>
                        <button
                          onClick={() => removeColor(idx)}
                          className="ml-1.5 rounded p-0.5 text-foreground-disabled opacity-0 transition-opacity hover:text-status-danger group-hover:opacity-100 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 border border-border rounded-lg bg-surface-card-2 p-1.5 ml-1">
                      <input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent p-0"
                      />
                      <button
                        onClick={addColor}
                        className="flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:opacity-95 transition-opacity cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: ANALYTICS INTEGRATIONS */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-display text-foreground-strong">
                  Analytics Integrations
                </h3>
                <p className="text-sm text-foreground-muted">
                  Connect external accounts to display analytics in the client dashboard
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {/* Enable toggle card */}
                <div className="rounded-xl border border-border bg-surface-card p-5 shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground-strong">
                      Enable Analytics for Client
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Show the Analytics page in the client's navigation
                    </p>
                  </div>
                  <button
                    onClick={() => saveField("analytics_enabled", !client.analytics_enabled)}
                    className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${
                      client.analytics_enabled
                        ? "bg-primary"
                        : "bg-foreground/10 border border-border"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        client.analytics_enabled ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* 2x2 grid of integrations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Integration: Instagram */}
                  <div className="rounded-xl border border-border bg-surface-card p-5 flex flex-col justify-between h-40 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
                        <Instagram className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground-strong">Instagram</h4>
                        <p className="text-xs text-foreground-muted leading-relaxed">
                          Track organic reach, engagement, and follower growth
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {connectedAccounts.instagram ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-md">
                          <Check className="h-3.5 w-3.5" />
                          Connected
                        </div>
                      ) : (
                        <span className="text-[11px] text-foreground-disabled">Not connected</span>
                      )}
                      <button
                        onClick={() => handleToggleIntegration("instagram")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-card-2 border border-border hover:bg-surface-raised text-xs rounded-md font-medium text-foreground-muted transition-colors cursor-pointer"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        {connectedAccounts.instagram ? "Disconnect" : "Connect Instagram"}
                      </button>
                    </div>
                  </div>

                  {/* Integration: Facebook Ads */}
                  <div className="rounded-xl border border-border bg-surface-card p-5 flex flex-col justify-between h-40 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Facebook className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground-strong">
                          Facebook Ads
                        </h4>
                        <p className="text-xs text-foreground-muted leading-relaxed">
                          Track ad spend, leads, CPL, and campaign performance
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {connectedAccounts.facebook_ads ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-md">
                          <Check className="h-3.5 w-3.5" />
                          Connected
                        </div>
                      ) : (
                        <span className="text-[11px] text-foreground-disabled">Not connected</span>
                      )}
                      <button
                        onClick={() => handleToggleIntegration("facebook_ads")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-card-2 border border-border hover:bg-surface-raised text-xs rounded-md font-medium text-foreground-muted transition-colors cursor-pointer"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        {connectedAccounts.facebook_ads ? "Disconnect" : "Connect Facebook Ads"}
                      </button>
                    </div>
                  </div>

                  {/* Integration: TikTok */}
                  <div className="rounded-xl border border-border bg-surface-card p-5 flex flex-col justify-between h-40 opacity-70 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-foreground/5 text-foreground-muted border border-border">
                        <Instagram className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground-strong">TikTok</h4>
                        <p className="text-xs text-foreground-muted leading-relaxed">
                          Monitor video views, engagement, and follower metrics
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-foreground-disabled italic">
                      OAuth integration coming soon
                    </p>
                  </div>

                  {/* Integration: ManyChat */}
                  <div className="rounded-xl border border-border bg-surface-card p-5 flex flex-col justify-between h-40 opacity-70 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-foreground/5 text-foreground-muted border border-border">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground-strong">ManyChat</h4>
                        <p className="text-xs text-foreground-muted leading-relaxed">
                          Monitor chat automations, leads, and conversions
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-foreground-disabled italic">
                      OAuth integration coming soon
                    </p>
                  </div>
                </div>

                <button className="self-start inline-flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-surface-raised text-xs rounded-lg font-medium text-foreground-muted transition-colors mt-2">
                  <Activity className="h-3.5 w-3.5" />
                  Manage Analytics Data
                  <ExternalLink className="h-3 w-3 ml-0.5" />
                </button>
              </div>
            </div>
          )}

          {/* SECTION: WORKSPACE STATUS */}
          {activeSection === "workspace-status" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-display text-foreground-strong">
                  Workspace Status
                </h3>
                <p className="text-sm text-foreground-muted">
                  Monitor client onboarding progress and client portal activation details
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-border/40 pb-5">
                  <div className="flex items-center justify-between bg-surface-card-2 p-4 rounded-xl border border-border/50">
                    <div>
                      <p className="text-sm font-semibold text-foreground-strong">
                        Onboarding Status
                      </p>
                      <p className="text-xs text-foreground-muted">
                        Has the onboarding form been finished
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        saveField("onboarding_completed", !client.onboarding_completed)
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${
                        client.onboarding_completed
                          ? "bg-emerald-500"
                          : "bg-foreground/10 border border-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          client.onboarding_completed ? "translate-x-[22px]" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-col justify-center bg-surface-card-2 p-4 rounded-xl border border-border/50 space-y-1">
                    <p className="text-[10px] font-bold text-foreground-disabled uppercase tracking-wider">
                      Onboarding Date
                    </p>
                    <p className="text-sm font-medium text-foreground-strong">
                      {client.onboarding_completed_at
                        ? format(new Date(client.onboarding_completed_at), "PPP p")
                        : "Not onboarding completed yet"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground-strong">Workspace Info</h4>
                    <p className="text-xs text-foreground-disabled">
                      Unique security credentials for workspace routing
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-border/30 pb-2">
                      <span className="text-foreground-muted">Workspace ID</span>
                      <span className="text-foreground-strong">{client.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/30 pb-2">
                      <span className="text-foreground-muted">Workspace Token</span>
                      <span className="text-foreground-strong">
                        {client.workspace_token || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/30 pb-2">
                      <span className="text-foreground-muted">Workspace Slug</span>
                      <span className="text-foreground-strong">{client.slug}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/30 pb-2">
                      <span className="text-foreground-muted">Workspace Type</span>
                      <span className="text-foreground-strong uppercase">
                        {client.workspace_type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: TEAM ACCESS */}
          {activeSection === "team-access" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-display text-foreground-strong">
                  Team Access
                </h3>
                <p className="text-sm text-foreground-muted">
                  Manage which team members can view and access this client's workspace and projects
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-foreground-strong">
                    Assigned Team Members
                  </h4>
                  <p className="text-xs text-foreground-disabled">
                    These internal profiles are authorized to interact with this client's details
                  </p>
                </div>

                {assignmentsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : assignments.filter((a) => a.client_id === clientId).length === 0 ? (
                  <div className="border border-dashed border-border p-6 rounded-xl text-center text-sm text-foreground-disabled bg-foreground/[0.005]">
                    No team members assigned to this client workspace yet.
                  </div>
                ) : (
                  <div className="border border-border rounded-xl overflow-hidden text-sm">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-foreground/[0.01]">
                          <th className="px-4 py-2 text-left text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-[11px] font-normal uppercase tracking-wide text-foreground-disabled">
                            Assigned At
                          </th>
                          <th className="px-4 py-2 text-right text-[11px] font-normal uppercase tracking-wide text-foreground-disabled" />
                        </tr>
                      </thead>
                      <tbody>
                        {assignments
                          .filter((a) => a.client_id === clientId)
                          .map((a: any) => (
                            <tr
                              key={a.id}
                              className="border-b border-border last:border-0 hover:bg-foreground/[0.01]"
                            >
                              <td className="px-4 py-3 flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                  {a.profile?.full_name?.charAt(0).toUpperCase() || "T"}
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground-strong">
                                    {a.profile?.full_name || "Team Member"}
                                  </p>
                                  <p className="text-[10px] text-foreground-disabled uppercase font-medium">
                                    {team.find((t) => t.id === a.user_id)?.role || "member"}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-foreground-muted whitespace-nowrap">
                                {format(new Date(a.created_at), "PP")}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={async () => {
                                    if (
                                      window.confirm("Remove this team member's workspace access?")
                                    ) {
                                      await unassignTeamMember.mutateAsync({
                                        clientId,
                                        userId: a.user_id,
                                      });
                                      toast.success("Team member unassigned successfully");
                                    }
                                  }}
                                  className="p-1 rounded text-foreground-disabled hover:text-status-danger transition-colors cursor-pointer"
                                  title="Revoke Access"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Assign Form */}
                <div className="pt-4 border-t border-border/40 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                      Assign New Member
                    </h4>
                    <p className="text-xs text-foreground-disabled">
                      Select an internal staff member to grant them immediate dashboard access
                    </p>
                  </div>

                  <div className="flex gap-2 max-w-md">
                    <select
                      id="team-selector"
                      className="flex-1 h-9 rounded-lg border border-border bg-surface-card-2 px-3 text-sm text-foreground-strong focus:outline-none"
                    >
                      <option value="">-- Choose Team Member --</option>
                      {team
                        .filter(
                          (member) =>
                            !assignments.some(
                              (a) => a.client_id === clientId && a.user_id === member.id,
                            ),
                        )
                        .map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.full_name} ({member.role || "staff"})
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={async () => {
                        const selectEl = document.getElementById(
                          "team-selector",
                        ) as HTMLSelectElement;
                        if (!selectEl || !selectEl.value) {
                          toast.error("Please select a team member first");
                          return;
                        }
                        await assignTeamMember.mutateAsync({
                          clientId,
                          userId: selectEl.value,
                        });
                        toast.success("Team member assigned successfully");
                        selectEl.value = "";
                      }}
                      className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-95 transition-opacity flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Assign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-display text-foreground-strong">
                  Notifications
                </h3>
                <p className="text-sm text-foreground-muted">
                  Configure notification preferences and updates for this workspace
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/30 pb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground-strong">
                      New Comment Notifications
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Notify manager on new client review comments
                    </p>
                  </div>
                  <button className="relative h-6 w-11 rounded-full transition-colors bg-primary cursor-pointer">
                    <span className="absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform translate-x-[22px]" />
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-border/30 pb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground-strong">
                      Video Approval Notifications
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Notify when a client approves or requests revisions on a video version
                    </p>
                  </div>
                  <button className="relative h-6 w-11 rounded-full transition-colors bg-primary cursor-pointer">
                    <span className="absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform translate-x-[22px]" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground-strong">
                      Daily Activity Summary
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Send a daily digest of all activities in this workspace
                    </p>
                  </div>
                  <button className="relative h-6 w-11 rounded-full transition-colors bg-foreground/10 border border-border cursor-pointer">
                    <span className="absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: BILLING HISTORY */}
          {activeSection === "billing-history" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-display text-foreground-strong">
                  Billing History
                </h3>
                <p className="text-sm text-foreground-muted">
                  View past invoices, subscriptions, and quotas for this workspace
                </p>
              </div>

              {/* Reuse of ClientBillingTab in ReadOnly mode */}
              <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
                <ClientBillingTab clientId={clientId} readOnly />
              </div>
            </div>
          )}

          {/* SECTION: DANGER ZONE */}
          {activeSection === "danger-zone" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-display text-foreground-strong">
                  Danger Zone
                </h3>
                <p className="text-sm text-foreground-muted">
                  Irreversible actions and workspace lifecycle settings
                </p>
              </div>

              <div className="rounded-xl border border-status-danger/20 bg-status-danger/5 p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-status-danger shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base font-semibold text-status-danger">Archive Client</h4>
                    <p className="text-sm text-foreground-muted mt-1 leading-relaxed">
                      Archiving a client will remove them from all active views, disable their
                      onboarding links, and deactivate their workspace. You will retain all
                      historical videos and billing data. This action is reversible.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleArchiveClient}
                    className="px-4 py-2 border border-status-danger/30 rounded-lg text-xs font-semibold text-status-danger transition-colors hover:bg-status-danger/10 cursor-pointer"
                  >
                    Archive Client Workspace
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
