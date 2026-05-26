CREATE OR REPLACE FUNCTION public.set_current_video_version(_video_id uuid, _version_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller has access to this video's tenant.
  IF NOT EXISTS (
    SELECT 1 FROM public.videos v
    WHERE v.id = _video_id
      AND v.tenant_id = public.tenant_id_for_user(auth.uid())
      AND public.has_any_role(auth.uid(),
        ARRAY['owner','manager','senior_editor','content_creator','editor']::public.app_role[])
  ) THEN
    RAISE EXCEPTION 'Not authorized to update versions for this video';
  END IF;

  -- Verify the chosen version belongs to the video.
  IF NOT EXISTS (
    SELECT 1 FROM public.video_versions
    WHERE id = _version_id AND video_id = _video_id
  ) THEN
    RAISE EXCEPTION 'Version does not belong to this video';
  END IF;

  -- Atomically flip is_current within the video scope.
  UPDATE public.video_versions
  SET is_current = (id = _version_id)
  WHERE video_id = _video_id;
END;
$$;