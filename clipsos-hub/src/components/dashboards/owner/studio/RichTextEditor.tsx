/**
 * RichTextEditor — Full TipTap rich-text editor with:
 *   • Pinned formatting toolbar (Google Docs-style)
 *   • Floating bubble menu on text selection (Bold/Italic/Underline/Link)
 *   • Custom right-click context menu
 *   • Official @tiptap/extension-details for collapsible toggle blocks
 *   • Auto-save on blur
 *
 * Used for: Cycle scripts, Pillars content, and any freeform writing surface.
 * Stores content as TipTap JSON in the database.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import HighlightExt from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import LinkExt from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Details, DetailsSummary, DetailsContent } from "@tiptap/extension-details";
import { FontSize } from "./FontSizeExtension";
import { EditorToolbar } from "./EditorToolbar";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  FileText,
  Scissors,
  Copy,
  ClipboardPaste,
  Trash2,
  Link as LinkIcon,
  Type,
  RemoveFormatting,
  ChevronRight,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Normalizes selection blocks to safely wrap them in a collapsible details node
 * without violating ProseMirror/TipTap schemas.
 */
function extractSummaryAndBody(
  blocks: any[],
  parentTypeName?: string,
): { summaryContent: any[]; bodyBlocks: any[] } {
  if (blocks.length === 0) {
    return {
      summaryContent: [{ type: "text", text: "Toggle Details" }],
      bodyBlocks: [{ type: "paragraph" }],
    };
  }

  const firstBlock = blocks[0];
  const remainingBlocks = blocks.slice(1);

  let summaryContent: any[] = [];
  let bodyBlocks: any[] = [];

  const getInlineContent = (node: any): any[] => {
    if (!node) return [];
    if (node.content && Array.isArray(node.content)) {
      if (
        node.type === "paragraph" ||
        node.type === "heading" ||
        node.type === "taskItem" ||
        node.type === "listItem"
      ) {
        const p = node.content.find((c: any) => c.type === "paragraph");
        if (p) return p.content || [];

        const inlineChildren = node.content.filter(
          (c: any) => c.type === "text" || c.type === "hardBreak",
        );
        if (inlineChildren.length > 0) return inlineChildren;
      }
      for (const child of node.content) {
        const found = getInlineContent(child);
        if (found.length > 0) return found;
      }
    }
    return [];
  };

  if (firstBlock.type === "paragraph" || firstBlock.type === "heading") {
    summaryContent = firstBlock.content || [];
    bodyBlocks = remainingBlocks;
  } else if (
    firstBlock.type === "bulletList" ||
    firstBlock.type === "orderedList" ||
    firstBlock.type === "taskList"
  ) {
    const items = firstBlock.content || [];
    if (items.length > 0) {
      const firstItem = items[0];
      summaryContent = getInlineContent(firstItem);

      const remainingItems = items.slice(1);
      const bodyListBlocks: any[] = [];

      const firstItemContent = firstItem.content || [];
      const firstItemRemainingBlocks = firstItemContent.filter((c: any) => c.type !== "paragraph");

      if (firstItemRemainingBlocks.length > 0) {
        bodyListBlocks.push({
          type: firstItem.type,
          attrs: firstItem.attrs,
          content: firstItemRemainingBlocks,
        });
      }

      if (remainingItems.length > 0) {
        bodyListBlocks.push(...remainingItems);
      }

      if (bodyListBlocks.length > 0) {
        bodyBlocks.push({
          type: firstBlock.type,
          attrs: firstBlock.attrs,
          content: bodyListBlocks,
        });
      }
      bodyBlocks.push(...remainingBlocks);
    } else {
      summaryContent = [];
      bodyBlocks = remainingBlocks;
    }
  } else if (firstBlock.type === "listItem" || firstBlock.type === "taskItem") {
    summaryContent = getInlineContent(firstBlock);
    const firstBlockContent = firstBlock.content || [];
    const firstBlockRemaining = firstBlockContent.filter((c: any) => c.type !== "paragraph");
    if (firstBlockRemaining.length > 0) {
      bodyBlocks.push({
        type: firstBlock.type,
        attrs: firstBlock.attrs,
        content: firstBlockRemaining,
      });
    }
    bodyBlocks.push(...remainingBlocks);
  } else if (firstBlock.type === "blockquote") {
    summaryContent = getInlineContent(firstBlock);
    const firstBlockContent = firstBlock.content || [];
    const firstBlockRemaining = firstBlockContent.filter((c: any) => c.type !== "paragraph");
    if (firstBlockRemaining.length > 0) {
      bodyBlocks.push({
        type: "blockquote",
        content: firstBlockRemaining,
      });
    }
    bodyBlocks.push(...remainingBlocks);
  } else {
    summaryContent = [];
    bodyBlocks = blocks;
  }

  const flattenInlineNodes = (nodes: any[]): any[] => {
    const flat: any[] = [];
    for (const node of nodes) {
      if (node.type === "text" || node.type === "hardBreak") {
        flat.push(node);
      } else if (node.content && Array.isArray(node.content)) {
        flat.push(...flattenInlineNodes(node.content));
      }
    }
    return flat;
  };

  summaryContent = flattenInlineNodes(summaryContent);

  if (summaryContent.length === 0) {
    summaryContent = [{ type: "text", text: "Toggle Details" }];
  }

  // Wrap any standalone listItem or taskItem nodes in bodyBlocks
  const processedBodyBlocks: any[] = [];
  let currentPendingList: any[] = [];
  let currentListType: string | null = null;

  const flushPendingList = () => {
    if (currentPendingList.length > 0 && currentListType) {
      processedBodyBlocks.push({
        type: currentListType,
        content: [...currentPendingList],
      });
      currentPendingList = [];
      currentListType = null;
    }
  };

  for (const block of bodyBlocks) {
    if (block.type === "listItem" || block.type === "taskItem") {
      const targetListType =
        block.type === "taskItem"
          ? "taskList"
          : parentTypeName === "orderedList"
            ? "orderedList"
            : "bulletList";

      if (currentListType && currentListType !== targetListType) {
        flushPendingList();
      }

      currentListType = targetListType;
      currentPendingList.push(block);
    } else {
      flushPendingList();
      processedBodyBlocks.push(block);
    }
  }
  flushPendingList();

  bodyBlocks = processedBodyBlocks;

  if (bodyBlocks.length === 0) {
    bodyBlocks = [{ type: "paragraph" }];
  }

  return { summaryContent, bodyBlocks };
}

interface RichTextEditorProps {
  content?: string | Record<string, unknown>;
  placeholder?: string;
  onSave?: (json: Record<string, unknown>) => void;
  dir?: "ltr" | "rtl";
  minHeight?: string;
  showToolbar?: boolean;
  enableScriptToggle?: boolean;
}

export function RichTextEditor({
  content,
  placeholder = "Start writing…",
  onSave,
  dir = "ltr",
  minHeight = "400px",
  showToolbar = true,
  enableScriptToggle = false,
}: RichTextEditorProps) {
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  // Store drag source position for reordering
  const dragNodePosRef = useRef<number | null>(null);

  // Keyboard shortcut refs to prevent stale closures in useEditor hook
  const handleSaveAsScriptRef = useRef<() => void>(() => {});
  const enableScriptToggleRef = useRef(enableScriptToggle);
  enableScriptToggleRef.current = enableScriptToggle;

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    hasSelection: boolean;
    selectedText: string;
  } | null>(null);
  const [formatSubmenuOpen, setFormatSubmenuOpen] = useState(false);

  // Track if a menu action is pending — prevents the document mousedown from closing menu prematurely
  const pendingActionRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Color,
      HighlightExt.configure({ multicolor: true }),
      TextStyle,
      FontFamily,
      FontSize,
      Underline,
      LinkExt.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      // Official Details extension — proper collapsible toggle blocks
      ...(enableScriptToggle
        ? [
            Details.configure({
              persist: true,
              HTMLAttributes: {
                "data-type": "details",
              },
              renderToggleButton: ({ element, isOpen }) => {
                console.log("renderToggleButton called, isOpen:", isOpen);
                element.setAttribute(
                  "aria-label",
                  isOpen ? "Collapse details content" : "Expand details content",
                );

                // Synchronize parent element's open attribute with the actual state
                const parent = element.parentElement;
                if (parent) {
                  if (isOpen) {
                    parent.setAttribute("open", "");
                  } else {
                    parent.removeAttribute("open");
                  }
                }

                // Prevent ProseMirror from intercepting mousedown on the toggle button
                element.onmousedown = (e) => {
                  console.log("toggle button mousedown");
                  e.preventDefault();
                  e.stopPropagation();
                };
                element.onclick = (e) => {
                  console.log("toggle button click");
                };
              },
            }),
            DetailsSummary.configure({
              HTMLAttributes: {
                "data-type": "detailsSummary",
              },
            }),
            DetailsContent.configure({
              HTMLAttributes: {
                "data-type": "detailsContent",
              },
            }),
          ]
        : []),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none focus:outline-none px-4 py-3 font-sans",
        dir,
        style: `min-height: ${minHeight}`,
      },
      handleKeyDown: (view, event) => {
        const isMod = event.metaKey || event.ctrlKey;
        const isShift = event.shiftKey;
        const isS = event.key.toLowerCase() === "s";

        if (isMod && isShift && isS) {
          if (enableScriptToggleRef.current) {
            event.preventDefault();
            handleSaveAsScriptRef.current();
            return true;
          }
        }
        return false;
      },
      handleDOMEvents: {
        contextmenu: (view, event) => {
          event.preventDefault();
          const wrap = editorWrapperRef.current?.getBoundingClientRect();
          if (!wrap) return false;
          const { from, to } = view.state.selection;
          const selectedText = from < to ? view.state.doc.textBetween(from, to) : "";
          setContextMenu({
            x: event.clientX - wrap.left,
            y: event.clientY - wrap.top,
            hasSelection: from < to,
            selectedText,
          });
          setFormatSubmenuOpen(false);
          return true;
        },
      },
    },
    onUpdate: ({ editor: e }) => {
      const text = e.getText();
      const trimmed = text.trim();
      setWordCount(trimmed ? trimmed.split(/\s+/).length : 0);
      setCharCount(trimmed.length);
    },
  });

  // Sync content from parent when it arrives after loading
  useEffect(() => {
    if (editor && content && !editor.getText().trim()) {
      editor.commands.setContent(content);
      const text = editor.getText().trim();
      setWordCount(text ? text.split(/\s+/).length : 0);
      setCharCount(text.length);
    }
  }, [editor, content]);

  // Track selection to position the floating bubble
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const { from, to } = editor.state.selection;
      if (to <= from) {
        setBubblePos(null);
        return;
      }
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      const wrap = editorWrapperRef.current?.getBoundingClientRect();
      if (!wrap || rect.width === 0) return;
      setBubblePos({
        x: rect.left + rect.width / 2 - wrap.left,
        y: rect.top - wrap.top - 8,
      });
    };
    editor.on("selectionUpdate", update);
    editor.on("blur", () => setBubblePos(null));
    return () => {
      editor.off("selectionUpdate", update);
    };
  }, [editor]);

  // Update direction when dir prop changes
  useEffect(() => {
    if (!editor) return;
    (editor.view.dom as HTMLElement).setAttribute("dir", dir);
  }, [editor, dir]);

  // Close context menu on click anywhere — with pendingAction guard
  useEffect(() => {
    if (!contextMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest("[data-context-menu]")) {
        return; // Don't close if clicking inside the context menu
      }
      if (pendingActionRef.current) {
        pendingActionRef.current = false;
        return; // Don't close — a menu action is in progress
      }
      setContextMenu(null);
      setFormatSubmenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [contextMenu]);

  /**
   * Drag-to-reorder for [data-type="details"] toggle blocks.
   * Because TipTap's Pro drag-handle extension requires paid deps, we use a
   * lightweight DOM-injection approach: a MutationObserver watches the editor
   * for details elements and injects a draggable grip button into each one.
   * On drop we use a ProseMirror transaction to move the node.
   */
  useEffect(() => {
    if (!editor || !enableScriptToggle) return;

    const GRIP_CLASS = "script-drag-grip";
    const proseMirrorDom = editor.view.dom as HTMLElement;
    let lastDragOverDetails: HTMLElement | null = null;

    const clearDragOverStyles = () => {
      if (lastDragOverDetails) {
        lastDragOverDetails.removeAttribute("data-drag-over");
        lastDragOverDetails = null;
      }
      proseMirrorDom.querySelectorAll('[data-type="details"]').forEach((el) => {
        el.removeAttribute("data-drag-over");
      });
    };

    const injectGrip = (detailsEl: HTMLElement) => {
      if (detailsEl.querySelector(`.${GRIP_CLASS}`)) return; // already injected

      const grip = document.createElement("button");
      grip.type = "button";
      grip.className = GRIP_CLASS;
      grip.title = "Drag to reorder";
      grip.draggable = true;
      grip.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <circle cx="4" cy="3" r="1.2"/><circle cx="10" cy="3" r="1.2"/>
        <circle cx="4" cy="7" r="1.2"/><circle cx="10" cy="7" r="1.2"/>
        <circle cx="4" cy="11" r="1.2"/><circle cx="10" cy="11" r="1.2"/>
      </svg>`;

      grip.addEventListener("dragstart", (e) => {
        // Find the ProseMirror position of this details node
        const view = editor.view;
        let pos: number | null = null;
        view.state.doc.descendants((node, nodePos) => {
          if (node.type.name === "details") {
            const domNode = view.nodeDOM(nodePos);
            if (domNode === detailsEl || detailsEl.contains(domNode as Node)) {
              pos = nodePos;
              return false;
            }
          }
        });
        dragNodePosRef.current = pos;
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", String(pos));
        }
        detailsEl.style.opacity = "0.5";
      });

      grip.addEventListener("dragend", () => {
        detailsEl.style.opacity = "";
        dragNodePosRef.current = null;
        clearDragOverStyles();
      });

      detailsEl.appendChild(grip);
    };

    const syncGrips = () => {
      proseMirrorDom.querySelectorAll<HTMLElement>('[data-type="details"]').forEach((detailsEl) => {
        injectGrip(detailsEl);
      });
    };

    // Handle drops on the editor
    const handleDrop = (e: DragEvent) => {
      const fromPos = dragNodePosRef.current;
      if (fromPos === null) return;
      e.preventDefault();
      clearDragOverStyles();

      const view = editor.view;
      const dropCoords = view.posAtCoords({ left: e.clientX, top: e.clientY });
      if (!dropCoords) return;

      const toPos = dropCoords.pos;
      const { state, dispatch } = view;
      const fromResolved = state.doc.resolve(fromPos);
      const node = fromResolved.nodeAfter;
      if (!node || node.type.name !== "details") return;

      // Resolve to top-level block position directly under doc (depth 1)
      const $to = state.doc.resolve(toPos);
      let targetPos = toPos;
      if ($to.depth > 0) {
        const topLevelNode = $to.node(1);
        const topLevelStart = $to.start(1) - 1;
        const topLevelEnd = topLevelStart + topLevelNode.nodeSize;

        if (toPos - topLevelStart < topLevelNode.nodeSize / 2) {
          targetPos = topLevelStart;
        } else {
          targetPos = topLevelEnd;
        }
      }

      if (targetPos === fromPos || targetPos === fromPos + node.nodeSize) {
        dragNodePosRef.current = null;
        return;
      }

      const nodeSize = node.nodeSize;
      const tr = state.tr.delete(fromPos, fromPos + nodeSize);
      // Adjust targetPos after deletion if it is after fromPos
      const insertPos = targetPos > fromPos ? targetPos - nodeSize : targetPos;
      const safeInsertPos = Math.max(0, Math.min(insertPos, tr.doc.content.size));
      tr.insert(safeInsertPos, node);
      dispatch(tr);
      dragNodePosRef.current = null;
    };

    const handleDragOver = (e: DragEvent) => {
      if (dragNodePosRef.current === null) return;
      e.preventDefault();

      const target = e.target as HTMLElement | null;
      const detailsEl = target?.closest('[data-type="details"]') as HTMLElement | null;

      if (detailsEl) {
        // Prevent highlighting the block we are dragging
        const view = editor.view;
        let isSource = false;
        view.state.doc.descendants((node, nodePos) => {
          if (node.type.name === "details" && nodePos === dragNodePosRef.current) {
            const domNode = view.nodeDOM(nodePos);
            if (domNode === detailsEl || detailsEl.contains(domNode as Node)) {
              isSource = true;
              return false;
            }
          }
        });

        if (!isSource) {
          if (lastDragOverDetails !== detailsEl) {
            if (lastDragOverDetails) {
              lastDragOverDetails.removeAttribute("data-drag-over");
            }
            detailsEl.setAttribute("data-drag-over", "true");
            lastDragOverDetails = detailsEl;
          }
          return;
        }
      }

      if (lastDragOverDetails) {
        lastDragOverDetails.removeAttribute("data-drag-over");
        lastDragOverDetails = null;
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      const rect = proseMirrorDom.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        clearDragOverStyles();
      }
    };

    proseMirrorDom.addEventListener("dragover", handleDragOver);
    proseMirrorDom.addEventListener("dragleave", handleDragLeave);
    proseMirrorDom.addEventListener("drop", handleDrop);

    // Initial injection + MutationObserver for dynamic changes
    syncGrips();
    const observer = new MutationObserver(syncGrips);
    observer.observe(proseMirrorDom, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      proseMirrorDom.removeEventListener("dragover", handleDragOver);
      proseMirrorDom.removeEventListener("dragleave", handleDragLeave);
      proseMirrorDom.removeEventListener("drop", handleDrop);
      // Clean up injected grips and styles
      clearDragOverStyles();
      proseMirrorDom.querySelectorAll(`.${GRIP_CLASS}`).forEach((el) => el.remove());
    };
  }, [editor, enableScriptToggle]);

  const handleSave = useCallback(() => {
    if (!editor || !onSave) return;
    onSave(editor.getJSON());
  }, [editor, onSave]);

  /* ────────────────────────────────────────────────────────────────── */
  /* Context menu actions                                               */
  /* ────────────────────────────────────────────────────────────────── */

  const closeMenu = () => {
    setContextMenu(null);
    setFormatSubmenuOpen(false);
  };

  const handleCut = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from < to) {
      const text = editor.state.doc.textBetween(from, to);
      navigator.clipboard.writeText(text).catch(() => {});
      editor.chain().focus().deleteSelection().run();
    }
    closeMenu();
  };

  const handleCopy = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from < to) {
      const text = editor.state.doc.textBetween(from, to);
      navigator.clipboard.writeText(text).catch(() => {});
    }
    closeMenu();
  };

  const handlePaste = async () => {
    if (!editor) return;
    try {
      const text = await navigator.clipboard.readText();
      editor.chain().focus().insertContent(text).run();
    } catch {
      editor.chain().focus().run();
    }
    closeMenu();
  };

  const handleDelete = () => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
    closeMenu();
  };

  const handleInsertLink = () => {
    closeMenu();
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const handleClearFormatting = () => {
    if (!editor) return;
    editor.chain().focus().clearNodes().unsetAllMarks().run();
    closeMenu();
  };

  /** Wrap selected text in a Details toggle block.
   *  - First paragraph of the selection becomes the detailsSummary (toggle title).
   *  - Remaining paragraphs become detailsContent.
   *  - For single-paragraph selections, the text becomes the title and content gets an empty paragraph.
   */
  const handleSaveAsScript = () => {
    if (!editor) return;
    const { state } = editor;
    const { from, to, $from, $to } = state.selection;

    if (from >= to) {
      closeMenu();
      return;
    }

    try {
      // Guard: Check if selection is already nested inside a details-related block or spans across details boundaries
      let isNestedOrSpanning = false;
      for (let depth = $from.depth; depth > 0; depth--) {
        const name = $from.node(depth).type.name;
        if (name === "details" || name === "detailsSummary" || name === "detailsContent") {
          isNestedOrSpanning = true;
          break;
        }
      }
      if (!isNestedOrSpanning) {
        for (let depth = $to.depth; depth > 0; depth--) {
          const name = $to.node(depth).type.name;
          if (name === "details" || name === "detailsSummary" || name === "detailsContent") {
            isNestedOrSpanning = true;
            break;
          }
        }
      }
      if (!isNestedOrSpanning) {
        state.doc.nodesBetween(from, to, (node) => {
          const name = node.type.name;
          if (name === "details" || name === "detailsSummary" || name === "detailsContent") {
            isNestedOrSpanning = true;
            return false;
          }
        });
      }

      if (isNestedOrSpanning) {
        console.warn(
          "[SaveAsScript] Selection is inside or contains details nodes, blocking nested wrapping.",
        );
        closeMenu();
        return;
      }

      // Get the block range covering the selection
      const range = $from.blockRange($to);
      if (!range) {
        console.warn("[SaveAsScript] No block range found");
        closeMenu();
        return;
      }

      // Collect all top-level block nodes in the selection range
      const blocks: Array<{ type: string; content?: unknown[] }> = [];
      state.doc.nodesBetween(range.start, range.end, (node, pos, parent) => {
        // Only collect direct children of the range parent (top-level blocks)
        if (parent === range.parent && node.isBlock) {
          const json = node.toJSON();
          blocks.push(json);
          return false; // Don't descend into this node
        }
        return true;
      });

      if (blocks.length === 0) {
        closeMenu();
        return;
      }

      // Extract normalized summary content and body blocks
      const { summaryContent, bodyBlocks } = extractSummaryAndBody(
        blocks,
        range.parent?.type?.name,
      );

      // Build the details node JSON
      const detailsNode = {
        type: "details",
        attrs: { open: true },
        content: [
          {
            type: "detailsSummary",
            content: summaryContent,
          },
          {
            type: "detailsContent",
            content: bodyBlocks,
          },
        ],
      };

      // Replace the selection range with the details block
      const isAtEnd = range.end === state.doc.content.size;
      const contentToInsert: any[] = [detailsNode];
      if (isAtEnd) {
        contentToInsert.push({ type: "paragraph" });
      }

      editor
        .chain()
        .focus()
        .insertContentAt({ from: range.start, to: range.end }, contentToInsert as any)
        .setTextSelection(range.start + 2)
        .run();
    } catch (err) {
      console.error("[SaveAsScript] Failed:", err);
    }
    closeMenu();
  };

  // Assign to mutable ref to prevent stale closures in useEditor hooks
  handleSaveAsScriptRef.current = handleSaveAsScript;

  /** Insert an empty toggle block at cursor */
  const handleInsertToggle = () => {
    if (!editor) return;
    try {
      const { state } = editor;
      const { from } = state.selection;
      const detailsNode = {
        type: "details",
        attrs: { open: true },
        content: [
          {
            type: "detailsSummary",
            content: [],
          },
          {
            type: "detailsContent",
            content: [{ type: "paragraph" }],
          },
        ],
      };
      const isAtEnd = from >= state.doc.content.size - 2;
      const contentToInsert = isAtEnd ? [detailsNode, { type: "paragraph" }] : [detailsNode];

      editor
        .chain()
        .focus()
        .insertContent(contentToInsert as any)
        .setTextSelection(from + 2)
        .run();
    } catch (err) {
      console.error("[InsertToggle] Failed:", err);
    }
  };

  /** Format action helper — runs format command and closes menu */
  const formatAction = (fn: () => void) => {
    pendingActionRef.current = true;
    fn();
    closeMenu();
  };

  return (
    <div
      ref={editorWrapperRef}
      className="flex flex-col flex-1 border border-border rounded-lg bg-surface-card relative"
      onBlur={(e) => {
        const related = e.relatedTarget as HTMLElement;
        if (related?.closest("[data-bubble-menu]")) return;
        if (related?.closest("[role='menu']")) return;
        if (related?.closest("[data-radix-popper-content-wrapper]")) return;
        if (related?.closest("[data-context-menu]")) return;
        handleSave();
      }}
    >
      {/* Toolbar pinned at top */}
      {showToolbar && (
        <EditorToolbar
          editor={editor}
          wordCount={wordCount}
          charCount={charCount}
          enableScriptToggle={enableScriptToggle}
          onInsertToggle={handleInsertToggle}
        />
      )}

      {/* Bubble menu on selection: Bold / Italic / Underline / Link */}
      {editor && bubblePos && (
        <div
          className="absolute z-50"
          style={{ left: bubblePos.x, top: bubblePos.y, transform: "translate(-50%, -100%)" }}
        >
          <div
            data-bubble-menu
            className="flex items-center gap-0.5 bg-popover border border-border rounded-full shadow-xl px-1.5 py-1 animate-in fade-in-0 zoom-in-95 duration-150"
          >
            <BubbleIcon title="Bold" onClick={() => editor.chain().focus().toggleBold().run()}>
              <Bold className="h-4 w-4" />
            </BubbleIcon>
            <BubbleIcon title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Italic className="h-4 w-4" />
            </BubbleIcon>
            <BubbleIcon
              title="Underline"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-4 w-4" />
            </BubbleIcon>
            <BubbleIcon
              title="Insert link"
              onClick={() => {
                const url = window.prompt("Enter URL:");
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}
            >
              <LinkIcon className="h-4 w-4" />
            </BubbleIcon>
          </div>
        </div>
      )}

      {/* Custom right-click context menu */}
      {editor && contextMenu && (
        <div
          data-context-menu
          className="absolute z-[60] animate-in fade-in-0 zoom-in-95 duration-100"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="w-[220px] rounded-xl border border-border bg-popover shadow-2xl py-1.5 overflow-hidden">
            <ContextMenuItem
              icon={<Scissors className="h-3.5 w-3.5" />}
              label="Cut"
              shortcut="⌘X"
              onClick={handleCut}
              disabled={!contextMenu.hasSelection}
            />
            <ContextMenuItem
              icon={<Copy className="h-3.5 w-3.5" />}
              label="Copy"
              shortcut="⌘C"
              onClick={handleCopy}
              disabled={!contextMenu.hasSelection}
            />
            <ContextMenuItem
              icon={<ClipboardPaste className="h-3.5 w-3.5" />}
              label="Paste"
              shortcut="⌘V"
              onClick={handlePaste}
            />
            <ContextMenuItem
              icon={<Trash2 className="h-3.5 w-3.5" />}
              label="Delete"
              onClick={handleDelete}
              disabled={!contextMenu.hasSelection}
            />

            <ContextMenuDivider />

            <ContextMenuItem
              icon={<LinkIcon className="h-3.5 w-3.5" />}
              label="Insert link"
              shortcut="⌘K"
              onClick={handleInsertLink}
            />

            <ContextMenuDivider />

            {/* Format options — submenu */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2.5 w-full px-3 py-1.5 text-[13px] text-foreground-strong hover:bg-surface-raised transition-colors"
                onMouseEnter={() => setFormatSubmenuOpen(true)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setFormatSubmenuOpen(!formatSubmenuOpen);
                }}
              >
                <Type className="h-3.5 w-3.5 text-foreground-muted" />
                <span className="flex-1 text-left">Format options</span>
                <ChevronRight className="h-3 w-3 text-foreground-muted" />
              </button>

              {formatSubmenuOpen && (
                <div
                  className="absolute left-full top-0 ml-0.5 w-[180px] rounded-xl border border-border bg-popover shadow-2xl py-1.5"
                  onMouseLeave={() => setFormatSubmenuOpen(false)}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <ContextMenuItem
                    icon={<Bold className="h-3.5 w-3.5" />}
                    label="Bold"
                    shortcut="⌘B"
                    onClick={() => formatAction(() => editor.chain().focus().toggleBold().run())}
                  />
                  <ContextMenuItem
                    icon={<Italic className="h-3.5 w-3.5" />}
                    label="Italic"
                    shortcut="⌘I"
                    onClick={() => formatAction(() => editor.chain().focus().toggleItalic().run())}
                  />
                  <ContextMenuItem
                    icon={<UnderlineIcon className="h-3.5 w-3.5" />}
                    label="Underline"
                    shortcut="⌘U"
                    onClick={() =>
                      formatAction(() => editor.chain().focus().toggleUnderline().run())
                    }
                  />
                  <ContextMenuItem
                    icon={<Strikethrough className="h-3.5 w-3.5" />}
                    label="Strikethrough"
                    onClick={() => formatAction(() => editor.chain().focus().toggleStrike().run())}
                  />
                  <ContextMenuDivider />
                  <ContextMenuItem
                    icon={<Highlighter className="h-3.5 w-3.5" />}
                    label="Highlight"
                    onClick={() =>
                      formatAction(() =>
                        editor.chain().focus().toggleHighlight({ color: "#ffff0040" }).run(),
                      )
                    }
                  />
                  <ContextMenuDivider />
                  <ContextMenuItem
                    icon={<AlignLeft className="h-3.5 w-3.5" />}
                    label="Align left"
                    onClick={() =>
                      formatAction(() => editor.chain().focus().setTextAlign("left").run())
                    }
                  />
                  <ContextMenuItem
                    icon={<AlignCenter className="h-3.5 w-3.5" />}
                    label="Align center"
                    onClick={() =>
                      formatAction(() => editor.chain().focus().setTextAlign("center").run())
                    }
                  />
                  <ContextMenuItem
                    icon={<AlignRight className="h-3.5 w-3.5" />}
                    label="Align right"
                    onClick={() =>
                      formatAction(() => editor.chain().focus().setTextAlign("right").run())
                    }
                  />
                </div>
              )}
            </div>

            <ContextMenuItem
              icon={<RemoveFormatting className="h-3.5 w-3.5" />}
              label="Clear formatting"
              shortcut="⌘\\"
              onClick={handleClearFormatting}
            />

            {/* Save as Script (toggle block) — only in cycle editors */}
            {contextMenu.hasSelection && enableScriptToggle && (
              <>
                <ContextMenuDivider />
                <ContextMenuItem
                  icon={<FileText className="h-3.5 w-3.5 text-amber-400" />}
                  label="Save as Script"
                  onClick={handleSaveAsScript}
                  highlight
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Editor content area */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Sub-components                                                          */
/* ──────────────────────────────────────────────────────────────────────── */

function BubbleIcon({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className="h-8 w-8 inline-flex items-center justify-center rounded-full text-foreground-muted hover:text-foreground hover:bg-surface-raised transition-colors"
    >
      {children}
    </button>
  );
}

function ContextMenuItem({
  icon,
  label,
  shortcut,
  onClick,
  disabled,
  highlight,
}: {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      className={cn(
        "flex items-center gap-2.5 w-full px-3 py-1.5 text-[13px] transition-colors",
        disabled
          ? "text-foreground-disabled cursor-not-allowed"
          : highlight
            ? "text-primary hover:bg-primary/8"
            : "text-foreground-strong hover:bg-surface-raised",
      )}
    >
      <span className="text-foreground-muted shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <span className="text-[11px] text-foreground-disabled ml-auto font-mono">{shortcut}</span>
      )}
    </button>
  );
}

function ContextMenuDivider() {
  return <div className="h-px bg-border mx-2 my-1" />;
}
