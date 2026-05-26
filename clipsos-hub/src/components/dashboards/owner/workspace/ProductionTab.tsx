/**
 * ProductionTab — cycle-grouped videos table for the active client workspace.
 *
 * Renders collapsible cycle sections (Cycle 3 Active, Cycle 2 Completed, …)
 * each containing a scoped VideosGrid. Uses CycleGroupedView to handle
 * the grouping layout and per-cycle data fetching.
 */
import { CycleGroupedView } from "./CycleGroupedView";

interface ProductionTabProps {
  clientId: string;
}

export function ProductionTab({ clientId }: ProductionTabProps) {
  return (
    <div className="flex flex-col">
      <CycleGroupedView clientId={clientId} />
    </div>
  );
}
