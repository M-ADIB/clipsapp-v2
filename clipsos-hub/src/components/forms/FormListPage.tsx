/**
 * FormListPage — Lists all forms for the tenant with status badges,
 * quick actions, and a "New Form" CTA.
 */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Plus,
  FileText,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Pencil,
  Trash2,
  BarChart3,
  Archive,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useForms, useDeleteForm, useUpdateForm } from "@/hooks/data";
import { useAuth } from "@/contexts/AuthContext";
import type { Form } from "@/integrations/supabase/db-types";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { FullBleed } from "@/components/app-shell/FullBleed";

export function FormListPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const rolePrefix = role === "manager" ? "/manager" : "/owner";

  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Form | null>(null);
  const { setHeaderConfig, clearHeaderConfig } = useWorkspaceHeader();

  useEffect(() => {
    setHeaderConfig({ title: "Forms", tabs: [] });
    return () => clearHeaderConfig();
  }, [setHeaderConfig, clearHeaderConfig]);

  const publishedFilter = filter === "published" ? true : filter === "draft" ? false : undefined;
  const { data: forms, isLoading } = useForms(
    publishedFilter !== undefined ? { published: publishedFilter } : undefined,
  );
  const deleteMutation = useDeleteForm();
  const updateMutation = useUpdateForm();

  const filtered = forms?.filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return f.title.toLowerCase().includes(q) || f.slug.toLowerCase().includes(q);
  });

  function handleCopyLink(slug: string) {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Form link copied to clipboard");
  }

  function handleArchive(form: Form) {
    updateMutation.mutate(
      { id: form.id, is_archived: true },
      { onSuccess: () => toast.success(`"${form.title}" archived`) },
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`"${deleteTarget.title}" deleted`);
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to delete form"),
    });
  }

  return (
    <FullBleed>
      <div className="flex flex-col gap-6 px-3 py-5 md:px-5 md:py-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Build and manage client intake forms, questionnaires, and surveys
          </p>
          <Button
            onClick={() => void navigate({ to: `${rolePrefix}/forms/new` as string })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Form
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            placeholder="Search forms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : !filtered?.length ? (
          <Card className="flex flex-col items-center justify-center py-16 gap-4 border-dashed">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-raised">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">No forms yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first form to start collecting responses
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void navigate({ to: `${rolePrefix}/forms/new` as string })}
              className="gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Form
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                rolePrefix={rolePrefix}
                onCopyLink={() => handleCopyLink(form.slug)}
                onArchive={() => handleArchive(form)}
                onDelete={() => setDeleteTarget(form)}
              />
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete form?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &ldquo;{deleteTarget?.title}&rdquo; and all its
                submissions. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </FullBleed>
  );
}

function FormCard({
  form,
  rolePrefix,
  onCopyLink,
  onArchive,
  onDelete,
}: {
  form: Form;
  rolePrefix: string;
  onCopyLink: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group relative flex items-center justify-between gap-4 p-4 transition-colors hover:bg-accent/5">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <a
            href={`${rolePrefix}/forms/${form.slug}/edit`}
            className="text-sm font-medium text-foreground hover:underline truncate block"
          >
            {form.title}
          </a>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-muted-foreground">/{form.slug}</span>
            <Badge
              variant={form.is_published ? "default" : "secondary"}
              className="text-[10px] h-5"
            >
              {form.is_published ? "Published" : "Draft"}
            </Badge>
            {form.is_published && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                Live
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href={`${rolePrefix}/forms/${form.slug}/submissions`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Submissions
        </a>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <a href={`${rolePrefix}/forms/${form.slug}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`${rolePrefix}/forms/${form.slug}/submissions`}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Submissions
              </a>
            </DropdownMenuItem>
            {form.is_published && (
              <DropdownMenuItem asChild>
                <a href={`/f/${form.slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Public Link
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onCopyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
