/**
 * Public form route — /f/:slug
 *
 * This route is OUTSIDE the _authenticated layout, so it's
 * accessible without login. The RLS policy on forms already
 * limits visibility to published + non-archived forms.
 */
import { createFileRoute } from "@tanstack/react-router";
import { PublicFormPage } from "@/components/forms/public/PublicFormPage";

export const Route = createFileRoute("/f/$slug")({
  component: PublicFormPage,
});
