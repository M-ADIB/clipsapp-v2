/**
 * SavedViewsMenu — list user's views + tenant-shared views, with save / share.
 */
import { Bookmark, Check, Plus, Share2 } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SavedViewSummary } from "../core/useGridView";

interface SavedViewsMenuProps {
  views: SavedViewSummary[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onSaveAs: (name: string) => void;
  onUpdate: () => void;
  onToggleShared: (id: string, shared: boolean) => void;
  onDelete: (id: string) => void;
}

export function SavedViewsMenu({
  views,
  activeId,
  onSelect,
  onSaveAs,
  onUpdate,
  onToggleShared,
  onDelete,
}: SavedViewsMenuProps) {
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [newName, setNewName] = useState("");
  const active = views.find((v) => v.id === activeId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-foreground/[0.06]">
          <Bookmark className="h-3 w-3 text-primary" />
          {active?.name ?? "Default view"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-[10px] uppercase">Views</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onSelect(null)}>
          <Check className={`mr-2 h-3 w-3 ${activeId === null ? "opacity-100" : "opacity-0"}`} />
          Default
        </DropdownMenuItem>
        {views.map((v) => (
          <DropdownMenuItem
            key={v.id}
            className="group flex items-center justify-between"
            onSelect={(e) => e.preventDefault()}
          >
            <button className="flex flex-1 items-center" onClick={() => onSelect(v.id)}>
              <Check
                className={`mr-2 h-3 w-3 ${activeId === v.id ? "opacity-100" : "opacity-0"}`}
              />
              <span className="flex-1 text-left">{v.name}</span>
              {v.is_shared && <Share2 className="h-3 w-3 text-primary" />}
            </button>
            {v.is_owner && (
              <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => onToggleShared(v.id, !v.is_shared)}
                  title={v.is_shared ? "Unshare" : "Share with team"}
                  className="ml-1 rounded p-0.5 text-foreground-disabled hover:text-primary"
                >
                  <Share2 className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onDelete(v.id)}
                  className="ml-0.5 rounded p-0.5 text-foreground-disabled hover:text-destructive text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {active && active.is_owner && (
          <DropdownMenuItem onClick={onUpdate}>Update “{active.name}”</DropdownMenuItem>
        )}
        {!showSaveAs ? (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setShowSaveAs(true);
            }}
          >
            <Plus className="mr-2 h-3 w-3" /> Save current as view…
          </DropdownMenuItem>
        ) : (
          <div className="flex items-center gap-1 p-1.5">
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="View name"
              className="h-7 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim()) {
                  onSaveAs(newName.trim());
                  setNewName("");
                  setShowSaveAs(false);
                }
              }}
            />
            <Button
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={!newName.trim()}
              onClick={() => {
                onSaveAs(newName.trim());
                setNewName("");
                setShowSaveAs(false);
              }}
            >
              Save
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
