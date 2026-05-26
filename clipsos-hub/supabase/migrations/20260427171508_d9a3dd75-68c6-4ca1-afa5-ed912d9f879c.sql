CREATE INDEX IF NOT EXISTS idx_videos_archived_at ON public.videos (archived_at);
CREATE INDEX IF NOT EXISTS idx_videos_order_index ON public.videos (tenant_id, project_id, order_index);
CREATE INDEX IF NOT EXISTS idx_video_editors_video ON public.video_editors (video_id);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'saved_filter_views_user_page_name_uniq'
  ) THEN
    ALTER TABLE public.saved_filter_views
      ADD CONSTRAINT saved_filter_views_user_page_name_uniq
      UNIQUE (user_id, page, name);
  END IF;
END $$;