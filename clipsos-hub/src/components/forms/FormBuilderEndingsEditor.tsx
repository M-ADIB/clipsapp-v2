/**
 * FormBuilderEndingsEditor — Configure multiple form endings for outcome routing.
 *
 * Each ending has a title, message, and optional redirect URL.
 * One ending is the "default" shown when no routing rules match.
 */
import { Plus, Trash2, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FormEnding } from "./form-builder-types";
import { createDefaultEnding } from "./form-builder-types";

interface Props {
  endings: FormEnding[];
  onChange: (endings: FormEnding[]) => void;
}

export function FormBuilderEndingsEditor({ endings, onChange }: Props) {
  function addEnding() {
    onChange([...endings, createDefaultEnding(false)]);
  }

  function removeEnding(id: string) {
    onChange(endings.filter((e) => e.id !== id));
  }

  function updateEnding(id: string, patch: Partial<FormEnding>) {
    onChange(endings.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function setDefault(id: string) {
    onChange(
      endings.map((e) => ({
        ...e,
        is_default: e.id === id,
      })),
    );
  }

  return (
    <div className="space-y-3">
      {endings.map((ending, i) => (
        <Card key={ending.id} className="p-3 space-y-3 bg-surface-card/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">Ending {i + 1}</span>
              {ending.is_default && (
                <Badge variant="secondary" className="text-[9px] h-4 px-1.5 gap-1">
                  <Star className="h-2.5 w-2.5" />
                  Default
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!ending.is_default && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => setDefault(ending.id)}
                >
                  Set Default
                </Button>
              )}
              {endings.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => removeEnding(ending.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Title</Label>
              <Input
                value={ending.title}
                onChange={(e) => updateEnding(ending.id, { title: e.target.value })}
                className="h-7 text-xs"
                placeholder="Thank you!"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Message</Label>
              <Textarea
                value={ending.message}
                onChange={(e) => updateEnding(ending.id, { message: e.target.value })}
                rows={2}
                className="text-xs resize-none"
                placeholder="Your response has been recorded."
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                <ExternalLink className="h-2.5 w-2.5" />
                Redirect URL
              </Label>
              <Input
                value={ending.redirect_url ?? ""}
                onChange={(e) =>
                  updateEnding(ending.id, {
                    redirect_url: e.target.value || undefined,
                  })
                }
                className="h-7 text-xs"
                placeholder="https://calendly.com/your-link"
              />
            </div>
          </div>
        </Card>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1.5 text-xs h-8"
        onClick={addEnding}
      >
        <Plus className="h-3 w-3" />
        Add Ending
      </Button>
    </div>
  );
}
