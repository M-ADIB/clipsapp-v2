/**
 * VideosDashboard — Owner > Videos
 *
 * The VideosGrid renders its own page header / toolbar / sort bar
 * (matching the standard ClipsOS table chrome).
 */
import { FullBleed } from "@/components/app-shell/FullBleed";
import { VideosGrid } from "@/components/grid/VideosGrid";

export function VideosDashboard() {
  return (
    <FullBleed>
      <VideosGrid scope={{}} viewKey="owner.videos" title="All Videos" />
    </FullBleed>
  );
}
