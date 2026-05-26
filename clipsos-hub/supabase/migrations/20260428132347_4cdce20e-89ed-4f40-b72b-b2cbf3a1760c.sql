
ALTER TABLE public.video_comments
  ADD COLUMN IF NOT EXISTS mentioned_user_ids uuid[] NOT NULL DEFAULT '{}'::uuid[];

CREATE INDEX IF NOT EXISTS idx_video_comments_mentioned_users
  ON public.video_comments USING gin (mentioned_user_ids);

CREATE OR REPLACE FUNCTION public.notify_comment_mentions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
  _video_title text;
  _author_name text;
BEGIN
  IF NEW.mentioned_user_ids IS NULL OR array_length(NEW.mentioned_user_ids, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT video_title INTO _video_title FROM public.videos WHERE id = NEW.video_id;
  SELECT COALESCE(display_name, full_name, 'Someone')
    INTO _author_name FROM public.profiles WHERE id = NEW.user_id;

  FOREACH _uid IN ARRAY NEW.mentioned_user_ids LOOP
    IF _uid = NEW.user_id THEN CONTINUE; END IF;
    INSERT INTO public.notifications (tenant_id, user_id, title, message, type, priority, link, metadata)
    VALUES (
      NEW.tenant_id,
      _uid,
      'You were mentioned',
      COALESCE(_author_name, 'Someone') || ' mentioned you on "' || COALESCE(_video_title, 'a video') || '"',
      'info',
      'normal',
      '/videos/' || NEW.video_id::text,
      jsonb_build_object('video_id', NEW.video_id, 'comment_id', NEW.id)
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_comment_mentions ON public.video_comments;
CREATE TRIGGER trg_notify_comment_mentions
AFTER INSERT ON public.video_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_comment_mentions();
