/**
 * EmailHub — central place to manage transactional emails.
 *
 * The four tabs (Compose, Templates, Editor, Outbox) live in the
 * UNIVERSAL top header (TopNav). Clicking a header tab fires
 * `headerConfig.onTabChange`, which we register here to swap content.
 * No second tab row inside the page — that was the duplicate the user saw.
 *
 * The Outbox tab internally contains sub-tabs for Scheduled and History.
 *
 * Same component is mounted under /owner/email-hub and /manager/email-hub.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { TabPanel } from "@/components/ui/tab-panel";
import {
  useEmailTemplates,
  useUpdateEmailTemplate,
  type EmailTemplate,
} from "@/hooks/use-email-templates";
import { TemplatesTab } from "./email-hub/TemplatesTab";
import { EditorTab } from "./email-hub/EditorTab";
import { ComposeTab } from "./email-hub/ComposeTab";
import { OutboxTab } from "./email-hub/OutboxTab";
import { DesignTab } from "./email-hub/DesignTab";

type HubTab = "compose" | "templates" | "editor" | "design" | "outbox";

const TABS: { key: HubTab; label: string }[] = [
  { key: "compose", label: "Compose" },
  { key: "templates", label: "Templates" },
  { key: "editor", label: "Editor" },
  { key: "design", label: "Design" },
  { key: "outbox", label: "Outbox" },
];

interface ComposePrefill {
  subject: string;
  headline: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
  preview_text: string;
}

export function EmailHub() {
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();
  const [tab, setTab] = useState<HubTab>("compose");

  const { data: templates, isLoading } = useEmailTemplates();
  const updateMutation = useUpdateEmailTemplate();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EmailTemplate | null>(null);
  const [composePrefill, setComposePrefill] = useState<ComposePrefill | null>(null);

  /** Register tabs in the universal header and listen for clicks */
  useEffect(() => {
    setHeaderConfig({
      title: "Email Hub",
      tabs: TABS.map((t) => ({ key: t.key, label: t.label })),
      activeTab: tab,
      onTabChange: (key) => setTab(key as HubTab),
    });
    return () => clearHeaderConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Keep the header's activeTab in sync when we switch internally */
  useEffect(() => {
    setHeaderConfig({
      title: "Email Hub",
      tabs: TABS.map((t) => ({ key: t.key, label: t.label })),
      activeTab: tab,
      onTabChange: (key) => setTab(key as HubTab),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  /** Auto-select first template */
  useEffect(() => {
    if (!selectedId && templates && templates.length > 0) {
      setSelectedId(templates[0].id);
    }
  }, [templates, selectedId]);

  /** Sync draft on selection change */
  useEffect(() => {
    if (!templates) return;
    const t = templates.find((x) => x.id === selectedId);
    if (t) setDraft(t);
  }, [selectedId, templates]);

  const handleSave = async () => {
    if (!draft) return;
    try {
      await updateMutation.mutateAsync({
        id: draft.id,
        name: draft.name,
        subject: draft.subject,
        headline: draft.headline ?? null,
        body: draft.body ?? null,
        cta_text: draft.cta_text ?? null,
        cta_url: draft.cta_url ?? null,
        preview_text: draft.preview_text ?? null,
        body_html: draft.body_html,
        edit_mode: draft.edit_mode === "html" ? "html" : "visual",
        is_active: draft.is_active ?? true,
      });
      toast.success("Template saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    }
  };

  return (
    <FullBleed>
      <div className="flex flex-col gap-6 px-3 py-5 md:px-5 md:py-6">
        <TabPanel active={tab === "compose"} lazy>
          <ComposeTab
            initialData={
              composePrefill
                ? {
                    subject: composePrefill.subject,
                    headline: composePrefill.headline,
                    body: composePrefill.body,
                    ctaText: composePrefill.ctaText,
                    ctaUrl: composePrefill.ctaUrl,
                    preview_text: composePrefill.preview_text,
                  }
                : null
            }
            onSaveAsTemplate={(_data) => {
              toast.info(
                "Save-as-template will create a draft you can finish in the Editor (next iteration).",
              );
            }}
          />
        </TabPanel>

        <TabPanel active={tab === "templates"}>
          <TemplatesTab
            templates={templates ?? []}
            isLoading={isLoading}
            onPick={(id) => {
              setSelectedId(id);
              setTab("editor");
            }}
            onNew={() => {
              setComposePrefill(null);
              setTab("compose");
            }}
          />
        </TabPanel>

        <TabPanel active={tab === "editor"} lazy>
          <EditorTab
            draft={draft}
            isLoading={isLoading}
            isSaving={updateMutation.isPending}
            templates={templates ?? []}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={setDraft}
            onSave={handleSave}
          />
        </TabPanel>

        <TabPanel active={tab === "design"} lazy>
          <DesignTab />
        </TabPanel>

        <TabPanel active={tab === "outbox"} lazy>
          <OutboxTab />
        </TabPanel>
      </div>
    </FullBleed>
  );
}
