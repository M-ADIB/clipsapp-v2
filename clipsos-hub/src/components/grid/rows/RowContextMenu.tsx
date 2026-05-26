/**
 * RowContextMenu — wraps any element and shows a right-click menu.
 *
 * Used on each grid row to expose Open / Duplicate / Move / Copy link / Archive.
 */
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ArrowDownToLine, ArrowUpToLine, Copy, ExternalLink, Files, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

interface RowContextMenuProps {
  children: ReactNode;
  canEdit: boolean;
  onOpen: () => void;
  onDuplicate: () => void;
  onCopyLink: () => void;
  onMoveTop: () => void;
  onMoveBottom: () => void;
  onArchive: () => void;
  rightClickedColumnId?: string | null;
  onClearCell?: (columnId: string) => void;
}

export function RowContextMenu({
  children,
  canEdit,
  onOpen,
  onDuplicate,
  onCopyLink,
  onMoveTop,
  onMoveBottom,
  onArchive,
  rightClickedColumnId,
  onClearCell,
}: RowContextMenuProps) {
  const isThumbnailRightClick = rightClickedColumnId === "thumbnail";
  const isVideoRightClick = rightClickedColumnId === "video";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem onClick={onOpen}>
          <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open
        </ContextMenuItem>
        <ContextMenuItem onClick={onCopyLink}>
          <Copy className="mr-2 h-3.5 w-3.5" /> Copy link
        </ContextMenuItem>
        {canEdit && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onDuplicate}>
              <Files className="mr-2 h-3.5 w-3.5" /> Duplicate
            </ContextMenuItem>
            <ContextMenuItem onClick={onMoveTop}>
              <ArrowUpToLine className="mr-2 h-3.5 w-3.5" /> Move to top
            </ContextMenuItem>
            <ContextMenuItem onClick={onMoveBottom}>
              <ArrowDownToLine className="mr-2 h-3.5 w-3.5" /> Move to bottom
            </ContextMenuItem>
            
            {(isThumbnailRightClick || isVideoRightClick) && (
              <>
                <ContextMenuSeparator />
                {isThumbnailRightClick && (
                  <ContextMenuItem onClick={() => onClearCell?.("thumbnail")} className="text-destructive">
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete thumbnail only
                  </ContextMenuItem>
                )}
                {isVideoRightClick && (
                  <ContextMenuItem onClick={() => onClearCell?.("video")} className="text-destructive">
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete video file only
                  </ContextMenuItem>
                )}
              </>
            )}

            <ContextMenuSeparator />
            <ContextMenuItem onClick={onArchive} className="text-destructive">
              <Trash2 className="mr-2 h-3.5 w-3.5" /> {isThumbnailRightClick || isVideoRightClick ? "Archive entire video" : "Archive"}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
