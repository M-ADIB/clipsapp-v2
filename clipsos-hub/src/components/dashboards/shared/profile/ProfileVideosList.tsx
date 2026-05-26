/**
 * ProfileVideosList — Shared table for displaying assigned videos on profile pages.
 * Renders video title, client, status (with DB color), and dates.
 */

import { formatDistanceToNow } from "date-fns";

interface VideoItem {
  id: string;
  title: string;
  clientName: string;
  statusSlug: string;
  statusName: string;
  statusColor: string;
  updatedAt: string;
  createdAt: string;
}

interface ProfileVideosListProps {
  videos: VideoItem[];
  emptyMessage?: string;
}

export function ProfileVideosList({
  videos,
  emptyMessage = "No videos assigned",
}: ProfileVideosListProps) {
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-surface-card p-8">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-card/50">
            <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground">
              Title
            </th>
            <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground">
              Client
            </th>
            <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground">
              Status
            </th>
            <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground">
              Last Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {videos.map((v) => (
            <tr
              key={v.id}
              className="border-b border-border last:border-0 transition-colors hover:bg-surface-card/70"
            >
              <td className="px-3 py-2.5 font-medium text-foreground-strong max-w-[250px] truncate">
                {v.title}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground truncate max-w-[160px]">
                {v.clientName}
              </td>
              <td className="px-3 py-2.5">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="block h-[6px] w-[6px] rounded-full"
                    style={{ backgroundColor: v.statusColor }}
                  />
                  <span className="text-xs" style={{ color: v.statusColor }}>
                    {v.statusName}
                  </span>
                </span>
              </td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(v.updatedAt), {
                  addSuffix: true,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
