/**
 * EditorToolbar — Google-Docs-style formatting toolbar for TipTap.
 *
 * Single row, compact buttons, color/highlight behind dropdown popovers,
 * font picker + font size controls, word/char count right-aligned.
 * Pinned at the top of the editor area.
 */
import { useState, useRef, useEffect, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListCollapse,
  Link as LinkIcon,
  Minus,
  Plus,
  Undo,
  Redo,
  Eraser,
  Highlighter,
  Baseline,
  ListTodo,
  Table,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface EditorToolbarProps {
  editor: Editor | null;
  wordCount: number;
  charCount?: number;
  enableScriptToggle?: boolean;
  onInsertToggle?: () => void;
}

/* ------------------------------------------------------------------ */
/* Color palette — Google Docs-style 10×8 grid                        */
/* ------------------------------------------------------------------ */
const COLOR_GRID = [
  // Row 1: blacks & grays
  [
    "#000000",
    "#434343",
    "#666666",
    "#999999",
    "#b7b7b7",
    "#cccccc",
    "#d9d9d9",
    "#efefef",
    "#f3f3f3",
    "#ffffff",
  ],
  // Row 2: vivid
  [
    "#980000",
    "#ff0000",
    "#ff9900",
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#4a86e8",
    "#0000ff",
    "#9900ff",
    "#ff00ff",
  ],
  // Row 3–8: tints
  [
    "#e6b8af",
    "#f4cccc",
    "#fce5cd",
    "#fff2cc",
    "#d9ead3",
    "#d0e0e3",
    "#c9daf8",
    "#cfe2f3",
    "#d9d2e9",
    "#ead1dc",
  ],
  [
    "#dd7e6b",
    "#ea9999",
    "#f9cb9c",
    "#ffe599",
    "#b6d7a8",
    "#a2c4c9",
    "#a4c2f4",
    "#9fc5e8",
    "#b4a7d6",
    "#d5a6bd",
  ],
  [
    "#cc4125",
    "#e06666",
    "#f6b26b",
    "#ffd966",
    "#93c47d",
    "#76a5af",
    "#6d9eeb",
    "#6fa8dc",
    "#8e7cc3",
    "#c27ba0",
  ],
  [
    "#a61c00",
    "#cc0000",
    "#e69138",
    "#f1c232",
    "#6aa84f",
    "#45818e",
    "#3c78d8",
    "#3d85c6",
    "#674ea7",
    "#a64d79",
  ],
  [
    "#85200c",
    "#990000",
    "#b45f06",
    "#bf9000",
    "#38761d",
    "#134f5c",
    "#1155cc",
    "#0b5394",
    "#351c75",
    "#741b47",
  ],
  [
    "#5b0f00",
    "#660000",
    "#783f04",
    "#7f6000",
    "#274e13",
    "#0c343d",
    "#1c4587",
    "#073763",
    "#20124d",
    "#4c1130",
  ],
];

const HIGHLIGHT_GRID = [
  ["#fce8e6", "#fef7e0", "#e8f5e9", "#e0f7fa", "#e8eaf6", "#fce4ec"],
  ["#f4cccc", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#ead1dc"],
  ["#ea9999", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#d5a6bd"],
  ["#e06666", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#c27ba0"],
  ["#cc0000", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#a64d79"],
  ["#990000", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#741b47"],
];

const FONTS = [
  { label: "DM Sans", value: "DM Sans" },
  { label: "Inter", value: "Inter" },
  { label: "Arial", value: "Arial" },
  { label: "Serif", value: "Georgia" },
  { label: "Mono", value: "monospace" },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96];
const DEFAULT_SIZE = 14;

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function ToolBtn({
  active,
  onClick,
  children,
  title,
  disabled,
  className: extraClass,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "h-7 w-7 inline-flex items-center justify-center rounded transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-foreground-muted hover:bg-surface-raised hover:text-foreground",
        disabled && "opacity-30 pointer-events-none",
        extraClass,
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

const Divider = () => <div className="w-px h-5 bg-border mx-1 shrink-0" />;

/**
 * Dropdown panel that opens below a trigger button.
 * Used for both color picker and highlight picker.
 */
function ColorPickerDropdown({
  trigger,
  grid,
  activeColor,
  onSelect,
  onClear,
  clearLabel = "None",
}: {
  trigger: ReactNode;
  grid: string[][];
  activeColor: string | undefined;
  onSelect: (color: string) => void;
  onClear?: () => void;
  clearLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="inline-flex"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
      >
        {trigger}
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border border-border bg-popover p-2 shadow-xl animate-in fade-in-0 zoom-in-95 duration-100">
          {grid.map((row, ri) => (
            <div key={ri} className="flex items-center gap-0.5 mb-0.5">
              {row.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "h-[18px] w-[18px] rounded-full border transition-transform hover:scale-125",
                    activeColor === color
                      ? "border-primary ring-1 ring-primary"
                      : "border-transparent hover:border-border",
                  )}
                  style={{ backgroundColor: color }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect(color);
                    setOpen(false);
                  }}
                  title={color}
                />
              ))}
            </div>
          ))}

          {onClear && (
            <div className="mt-1.5 flex items-center border-t border-border pt-1.5">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] text-foreground-muted hover:bg-surface-raised hover:text-foreground transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onClear();
                  setOpen(false);
                }}
              >
                <Eraser className="h-3 w-3" />
                {clearLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Toolbar                                                        */
/* ------------------------------------------------------------------ */

export function EditorToolbar({
  editor,
  wordCount,
  charCount = 0,
  enableScriptToggle = false,
  onInsertToggle,
}: EditorToolbarProps) {
  if (!editor) return null;

  // Parse current font size from the editor
  const rawSize = editor.getAttributes("textStyle").fontSize;
  const currentSize = rawSize ? parseInt(rawSize, 10) : DEFAULT_SIZE;

  const setFontSize = (size: number) => {
    const clamped = Math.max(1, Math.min(400, size));
    editor.chain().focus().setFontSize(`${clamped}px`).run();
  };

  const setLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // Get active text color / highlight color
  const activeTextColor = editor.getAttributes("textStyle").color as string | undefined;
  const activeHighlight = editor.getAttributes("highlight").color as string | undefined;

  return (
    <div className="sticky top-0 z-10 flex items-center gap-0.5 flex-wrap border-b border-border bg-surface-card/95 backdrop-blur-sm px-2 py-1.5 shrink-0">
      {/* Undo / Redo */}
      <ToolBtn
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (⌘Z)"
      >
        <Undo className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (⌘⇧Z)"
      >
        <Redo className="h-3.5 w-3.5" />
      </ToolBtn>

      <Divider />

      {/* Font picker */}
      <Select
        value={editor.getAttributes("textStyle").fontFamily || "DM Sans"}
        onValueChange={(val) => editor.chain().focus().setFontFamily(val).run()}
      >
        <SelectTrigger className="h-7 w-[100px] text-[11px] border-none bg-transparent hover:bg-surface-raised transition-colors gap-1 px-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONTS.map((f) => (
            <SelectItem
              key={f.value}
              value={f.value}
              className="text-xs"
              style={{ fontFamily: f.value }}
            >
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Divider />

      {/* Font size: − [size] + */}
      <ToolBtn
        onClick={() => {
          const idx = FONT_SIZES.indexOf(currentSize);
          if (idx > 0) setFontSize(FONT_SIZES[idx - 1]);
          else setFontSize(Math.max(1, currentSize - 1));
        }}
        title="Decrease font size"
      >
        <Minus className="h-3 w-3" />
      </ToolBtn>
      <input
        type="text"
        value={currentSize}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) setFontSize(v);
        }}
        className="h-7 w-9 rounded border border-border bg-transparent px-1 text-center text-[11px] text-foreground focus:outline-none focus:border-primary tabular-nums"
        title="Font size"
      />
      <ToolBtn
        onClick={() => {
          const idx = FONT_SIZES.indexOf(currentSize);
          if (idx >= 0 && idx < FONT_SIZES.length - 1) setFontSize(FONT_SIZES[idx + 1]);
          else setFontSize(currentSize + 1);
        }}
        title="Increase font size"
      >
        <Plus className="h-3 w-3" />
      </ToolBtn>

      <Divider />

      {/* B I U S */}
      <ToolBtn
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (⌘B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (⌘I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (⌘U)"
      >
        <Underline className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough (⌘⇧X)"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolBtn>

      <Divider />

      {/* Text color — button with color underline, opens dropdown */}
      <ColorPickerDropdown
        grid={COLOR_GRID}
        activeColor={activeTextColor}
        onSelect={(color) => editor.chain().focus().setColor(color).run()}
        onClear={() => editor.chain().focus().unsetColor().run()}
        clearLabel="Default"
        trigger={
          <div
            className={cn(
              "h-7 w-7 inline-flex flex-col items-center justify-center rounded transition-colors",
              "text-foreground-muted hover:bg-surface-raised hover:text-foreground",
            )}
            title="Text color"
          >
            <Baseline className="h-3.5 w-3.5" />
            <div
              className="h-[3px] w-3.5 rounded-full mt-px"
              style={{
                backgroundColor: activeTextColor || "currentColor",
              }}
            />
          </div>
        }
      />

      {/* Highlight — button with color underline, opens dropdown */}
      <ColorPickerDropdown
        grid={HIGHLIGHT_GRID}
        activeColor={activeHighlight}
        onSelect={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
        onClear={() => editor.chain().focus().unsetHighlight().run()}
        clearLabel="None"
        trigger={
          <div
            className={cn(
              "h-7 w-7 inline-flex flex-col items-center justify-center rounded transition-colors",
              "text-foreground-muted hover:bg-surface-raised hover:text-foreground",
            )}
            title="Highlight color"
          >
            <Highlighter className="h-3.5 w-3.5" />
            <div
              className="h-[3px] w-3.5 rounded-full mt-px"
              style={{
                backgroundColor: activeHighlight || "#ffff00",
              }}
            />
          </div>
        }
      />

      <Divider />

      {/* Link */}
      <ToolBtn active={editor.isActive("link")} onClick={setLink} title="Insert Link (⌘K)">
        <LinkIcon className="h-3.5 w-3.5" />
      </ToolBtn>

      <Divider />

      {/* Alignment */}
      <ToolBtn
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        title="Align Left"
      >
        <AlignLeft className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        title="Align Center"
      >
        <AlignCenter className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        title="Align Right"
      >
        <AlignRight className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        title="Justify"
      >
        <AlignJustify className="h-3.5 w-3.5" />
      </ToolBtn>

      <Divider />

      {/* Lists */}
      <ToolBtn
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <List className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Ordered List"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        title="Task List"
      >
        <ListTodo className="h-3.5 w-3.5" />
      </ToolBtn>

      <Divider />

      {/* Table Operations */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "h-7 w-7 inline-flex items-center justify-center rounded transition-colors",
              editor.isActive("table")
                ? "bg-primary/15 text-primary"
                : "text-foreground-muted hover:bg-surface-raised hover:text-foreground",
            )}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            title="Table operations"
          >
            <Table className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="w-[180px] bg-popover border border-border rounded-xl shadow-2xl py-1.5 z-[70]"
        >
          <DropdownMenuItem
            className="text-xs"
            onSelect={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          >
            Insert Table (3x3)
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem
            className="text-xs"
            disabled={!editor.isActive("table")}
            onSelect={() => editor.chain().focus().addColumnBefore().run()}
          >
            Add Column Before
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            disabled={!editor.isActive("table")}
            onSelect={() => editor.chain().focus().addColumnAfter().run()}
          >
            Add Column After
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs text-destructive focus:text-destructive"
            disabled={!editor.isActive("table")}
            onSelect={() => editor.chain().focus().deleteColumn().run()}
          >
            Delete Column
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem
            className="text-xs"
            disabled={!editor.isActive("table")}
            onSelect={() => editor.chain().focus().addRowBefore().run()}
          >
            Add Row Before
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            disabled={!editor.isActive("table")}
            onSelect={() => editor.chain().focus().addRowAfter().run()}
          >
            Add Row After
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs text-destructive focus:text-destructive"
            disabled={!editor.isActive("table")}
            onSelect={() => editor.chain().focus().deleteRow().run()}
          >
            Delete Row
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem
            className="text-xs"
            disabled={!editor.isActive("table")}
            onSelect={() => editor.chain().focus().toggleHeaderRow().run()}
          >
            Toggle Header Row
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem
            className="text-xs text-destructive focus:text-destructive"
            disabled={!editor.isActive("table")}
            onSelect={() => editor.chain().focus().deleteTable().run()}
          >
            Delete Table
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Toggle (collapsible block) — only when script toggle is enabled */}
      {enableScriptToggle && onInsertToggle && (
        <ToolBtn onClick={onInsertToggle} title="Insert Toggle">
          <ListCollapse className="h-3.5 w-3.5" />
        </ToolBtn>
      )}

      <Divider />

      {/* Headings (compact) */}
      <Select
        value={
          editor.isActive("heading", { level: 1 })
            ? "1"
            : editor.isActive("heading", { level: 2 })
              ? "2"
              : editor.isActive("heading", { level: 3 })
                ? "3"
                : "p"
        }
        onValueChange={(val) => {
          if (val === "p") {
            editor.chain().focus().setParagraph().run();
          } else {
            editor
              .chain()
              .focus()
              .toggleHeading({ level: parseInt(val) as 1 | 2 | 3 })
              .run();
          }
        }}
      >
        <SelectTrigger className="h-7 w-[110px] text-[11px] border-none bg-transparent hover:bg-surface-raised transition-colors gap-1 px-2">
          <SelectValue placeholder="Normal text" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="p" className="text-xs">
            Normal text
          </SelectItem>
          <SelectItem value="1" className="text-base font-bold">
            Heading 1
          </SelectItem>
          <SelectItem value="2" className="text-sm font-bold">
            Heading 2
          </SelectItem>
          <SelectItem value="3" className="text-xs font-bold">
            Heading 3
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Word + Character count */}
      <div className="flex items-center gap-2.5 text-[10px] text-foreground-disabled tabular-nums font-mono select-none">
        <span>
          {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
        </span>
        <span className="w-px h-3 bg-border" />
        <span>
          {charCount.toLocaleString()} {charCount === 1 ? "char" : "chars"}
        </span>
      </div>
    </div>
  );
}
