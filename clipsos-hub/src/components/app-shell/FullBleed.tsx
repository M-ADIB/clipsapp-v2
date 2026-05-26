/**
 * FullBleed — escape hatch for pages that need to fill the main content area
 * edge-to-edge (e.g. data tables with their own header/toolbar chrome).
 *
 * AppShell's <main> applies `p-4 md:p-6`. FullBleed cancels that padding with
 * symmetric negative margins and stretches to the viewport so sticky toolbars
 * and footers compute against the right baseline.
 *
 * Usage:
 *   <FullBleed>
 *     <PageHeader />
 *     <Toolbar />
 *     <Table />
 *   </FullBleed>
 */
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FullBleedProps {
  children: ReactNode;
  className?: string;
}

export function FullBleed({ children, className }: FullBleedProps) {
  return (
    <div
      className={cn(
        "flex flex-col -m-4 min-h-[calc(100dvh-45px)] md:-m-6 md:min-h-[calc(100dvh-52px)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
