import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useMemo, useState, useRef } from "react";
import { FullBleed } from "@/components/app-shell/FullBleed";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { useGridRows } from "@/components/grid/core/useGridRows";
import { useGridMutations } from "@/components/grid/core/useGridMutations";
import { BUILTIN_COLUMNS } from "@/components/grid/core/builtinColumns";
import { VideoPreviewModal } from "@/components/video/preview";

function renderEventContent(eventInfo: any) {
  const title = eventInfo.event.title;
  const { thumbnailUrl, statusLabel, statusColor } = eventInfo.event.extendedProps;

  return (
    <div 
      className="flex items-center gap-2 p-1.5 w-full rounded-lg border bg-surface-card hover:bg-surface-raised transition-all duration-200 shadow-sm overflow-hidden min-w-0"
      style={{ 
        borderColor: "var(--border)",
        borderLeft: `3px solid ${statusColor}`
      }}
    >
      {thumbnailUrl ? (
        <div
          className="h-8 w-8 shrink-0 overflow-hidden rounded bg-foreground/[0.08]"
          style={{
            backgroundImage: `url(${thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : (
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-foreground/[0.08] flex items-center justify-center">
          <span className="text-[9px] text-foreground-disabled">No Img</span>
        </div>
      )}
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[11px] font-semibold text-foreground-strong">{title}</p>
        <p className="text-[9px] text-foreground-muted font-medium mt-0.5 truncate">{statusLabel}</p>
      </div>
    </div>
  );
}

export function PostingCalendar({
  embedded = false,
  active = true,
}: {
  embedded?: boolean;
  active?: boolean;
}) {
  const { user, tenantId } = useAuth();
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    if (embedded) return;
    setHeaderConfig({ title: "Calendar" });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig, embedded]);

  useEffect(() => {
    if (active && calendarRef.current) {
      const timer = setTimeout(() => {
        const api = calendarRef.current?.getApi();
        if (api) {
          api.updateSize();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [active]);

  const { data: clientIds = [] } = useQuery({
    queryKey: ["client_access", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_access")
        .select("client_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.client_id);
    },
  });

  const primaryClientId = clientIds[0];
  const scope = useMemo(() => ({ clientId: primaryClientId }), [primaryClientId]);
  const { rows } = useGridRows(scope);
  const { updateCell } = useGridMutations(scope);

  const postDateColumn = useMemo(() => BUILTIN_COLUMNS.find((c) => c.id === "post_date"), []);

  const events = useMemo(() => {
    return rows
      .filter((r) => r.data.post_date)
      .map((r) => ({
        id: r.id,
        title: (r.data.video_title as string | null) ?? "Untitled",
        start: r.data.post_date as string,
        allDay: true,
        extendedProps: {
          thumbnailUrl: r.data.video_thumbnail_url as string | null,
          statusLabel: (r.data.status as { display_name?: string } | null)?.display_name ?? "—",
          statusColor: (r.data.status as { color?: string } | null)?.color ?? "#6366f1",
        }
      }));
  }, [rows]);

  if (!tenantId) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden px-4 py-5 md:px-6">
      <div className="rounded-2xl border border-border bg-surface-card p-4 sales-calendar shadow-xl flex-1 flex flex-col min-h-0">
        <div className="flex-grow flex flex-col min-h-0">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek",
            }}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
            }}
            events={events}
            eventContent={renderEventContent}
            editable
            height="100%"
            eventDrop={(info: { event: { id: string; startStr: string } }) => {
              if (!postDateColumn) return;
              const newDate = info.event.startStr;
              updateCell.mutate({
                rowId: info.event.id,
                column: { ...postDateColumn, visible: true, order: 0 },
                value: newDate,
              });
            }}
            eventClick={(info) => {
              setSelectedVideoId(info.event.id);
              setPreviewOpen(true);
            }}
          />
        </div>
      </div>

      <VideoPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        videoId={selectedVideoId}
        mode="review"
      />
    </div>
  );
}
