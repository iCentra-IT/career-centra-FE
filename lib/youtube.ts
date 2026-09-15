// Pulls the 11-char video id out of any of the URL shapes YouTube hands out — watch/share links,
// the youtu.be short form, and embed/shorts links — so a single admin-pasted URL can drive both
// the inline player (embed/{id}) and the thumbnail (img.youtube.com/vi/{id}).
export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");

    if (host === "youtu.be") {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }
    if (host === "youtube.com" || host === "music.youtube.com") {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      const match = parsed.pathname.match(/^\/(embed|shorts|live)\/([^/]+)/);
      if (match) return match[2];
    }
    return null;
  } catch {
    return null;
  }
}

export function youTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// youtube-nocookie.com keeps the embed inline (no redirect to youtube.com) and skips cookies
// until the viewer actually presses play.
export function youTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
}
