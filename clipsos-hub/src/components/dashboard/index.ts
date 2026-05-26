/**
 * Dashboard component barrel export.
 *
 * Reusable UI primitives shared across role dashboards.
 * Import from `@/components/dashboard`.
 */

/* --- Shared across all dashboards --- */
export { StatCard } from "./StatCard";
export { SparklineBar } from "./SparklineBar";
export { ProgressRow } from "./ProgressRow";
export { NotificationRow } from "./NotificationRow";
export { ActivityRow } from "./ActivityRow";
export { FilterPills } from "./FilterPills";
export { SectionLabel } from "./SectionLabel";
export { DashboardPanel } from "./DashboardPanel";

/* --- Client + Owner dashboards --- */
export { PipelineStepCard } from "./PipelineStepCard";
export { TaskCard } from "./TaskCard";
export { ProjectCard } from "./ProjectCard";

/* --- Client Workspace (owner view) --- */
export { JourneyEventCard } from "./JourneyEventCard";
export { GrowthChart } from "./GrowthChart";
export { NoteCard } from "./NoteCard";

/* --- Table & Badges (My Videos) --- */
export { StatusBadge } from "./StatusBadge";
export { VideoTypePill } from "./VideoTypePill";
export { DataTable } from "./DataTable";
export type { DataTableColumn } from "./DataTable";
