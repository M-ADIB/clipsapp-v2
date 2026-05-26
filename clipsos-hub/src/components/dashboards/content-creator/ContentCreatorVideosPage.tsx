/**
 * ContentCreatorVideosPage — Content Creator > Videos
 *
 * Same VideosGrid as the owner but with a content-creator-specific
 * viewKey so saved filters/views are role-scoped.
 * RLS at the DB enforces actual data access.
 */
import { FullBleed } from "@/components/app-shell/FullBleed";
import { VideosGrid } from "@/components/grid/VideosGrid";

export function ContentCreatorVideosPage() {
  return (
    <FullBleed>
      <VideosGrid scope={{}} viewKey="content-creator.videos" title="All Videos" />
    </FullBleed>
  );
}
