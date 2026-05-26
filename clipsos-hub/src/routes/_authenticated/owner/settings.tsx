/**
 * /owner/settings — Owner settings hub.
 * Tabs: App Branding, Team, Billing, Integrations
 */
import { createFileRoute } from "@tanstack/react-router";
import { OwnerSettingsPage } from "@/components/dashboards/owner/OwnerSettingsPage";

export const Route = createFileRoute("/_authenticated/owner/settings")({
  component: OwnerSettingsPage,
});
