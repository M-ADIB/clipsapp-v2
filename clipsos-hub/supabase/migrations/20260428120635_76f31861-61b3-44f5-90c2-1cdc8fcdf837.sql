
-- Scope enum for share links
DO $$ BEGIN
  CREATE TYPE public.share_scope AS ENUM ('video', 'videos', 'cycle');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.guest_review_links
  ADD COLUMN IF NOT EXISTS scope public.share_scope NOT NULL DEFAULT 'video',
  ADD COLUMN IF NOT EXISTS target_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cycle_id uuid REFERENCES public.cycles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS allow_download boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_comments boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_guest_review_links_cycle_id
  ON public.guest_review_links(cycle_id);
CREATE INDEX IF NOT EXISTS idx_guest_review_links_scope
  ON public.guest_review_links(scope);
