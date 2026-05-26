import { createFileRoute } from "@tanstack/react-router";
import { ProductionBoard } from "@/components/dashboards/senior-editor/ProductionBoard";

export const Route = createFileRoute("/_authenticated/senior-editor/")({
  component: ProductionBoard,
});
