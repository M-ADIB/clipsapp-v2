/**
 * FormBuilderSidebar — Left panel with categorised draggable field type buttons.
 *
 * Categories: Input · Choice · Advanced · Layout
 */
import {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  Link,
  CircleDot,
  CheckSquare,
  Calendar,
  Upload,
  Star,
  ToggleLeft,
  Heading,
  Text,
  ChevronDown,
  Globe,
  SlidersHorizontal,
  ShieldCheck,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FIELD_TYPES, type FieldType, type FieldCategory } from "./form-builder-types";

const ICON_MAP: Record<string, React.ElementType> = {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  Link,
  CircleDot,
  CheckSquare,
  Calendar,
  Upload,
  Star,
  ToggleLeft,
  Heading,
  Text,
  ChevronDown,
  Globe,
  SlidersHorizontal,
  ShieldCheck,
  EyeOff,
};

const CATEGORY_LABELS: Record<FieldCategory, string> = {
  input: "Input Fields",
  choice: "Choice Fields",
  advanced: "Advanced",
  layout: "Layout",
};

const CATEGORY_ORDER: FieldCategory[] = ["input", "choice", "advanced", "layout"];

interface Props {
  onAddField: (type: FieldType) => void;
  isMultiStep?: boolean;
}

export function FormBuilderSidebar({ onAddField, isMultiStep }: Props) {
  return (
    <div className="w-64 shrink-0 border-r border-border bg-surface-card/30">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Field Types
        </h3>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        {CATEGORY_ORDER.map((category, catIdx) => {
          const categoryFields = FIELD_TYPES.filter((f) => f.category === category);

          return (
            <div key={category}>
              {catIdx > 0 && <Separator className="mx-3" />}
              <div className="px-4 py-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {CATEGORY_LABELS[category]}
                </span>
              </div>
              <div className="px-3 pb-2 space-y-0.5">
                {categoryFields.map((f) => {
                  const Icon = ICON_MAP[f.icon] ?? Type;
                  const isNew = ["country", "dropdown", "scale", "consent", "hidden"].includes(
                    f.type,
                  );

                  return (
                    <Button
                      key={f.type}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-xs font-normal h-9"
                      onClick={() => onAddField(f.type)}
                    >
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {f.label}
                      {isNew && (
                        <Badge
                          variant="outline"
                          className="ml-auto text-[9px] h-4 px-1 border-primary/30 text-primary"
                        >
                          New
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
}
