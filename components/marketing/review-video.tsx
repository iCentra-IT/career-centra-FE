"use client";

import { useState } from "react";
import { youTubeEmbedUrl, youTubeThumbnailUrl } from "@/lib/youtube";

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7.5 5.8l7 4.2-7 4.2V5.8z" fill="#0c236c" />
    </svg>
  );
}

// Click-to-play so a page with several review videos doesn't load every iframe (and its cookies)
// up front — a YouTube thumbnail stands in until the viewer presses play, then swaps to an inline
// youtube-nocookie.com embed. They never leave the site to watch.
export function ReviewVideo({ videoId, title = "Learner review video" }: { videoId: string; title?: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900 shadow-sm">
      {playing ? (
        <iframe
          src={youTubeEmbedUrl(videoId)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${title}`}
          className="group absolute inset-0 flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- an img.youtube.com thumbnail, not worth configuring next/image's domains for */}
          <img
            src={youTubeThumbnailUrl(videoId)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-opacity group-hover:opacity-80"
          />
          <span className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-105">
            <PlayIcon />
          </span>
        </button>
      )}
    </div>
  );
}
