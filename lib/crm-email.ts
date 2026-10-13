// Turns what a marketer types (plain English, blank line between paragraphs) into the HTML body the
// campaign API expects. Escapes everything first, so typed text can never inject markup — the
// markdown-style image/link syntax below is matched and rebuilt *after* escaping, so the URLs it
// lifts out of `![alt](url)` / `[text](url)` are the only place a raw href/src ever comes from.

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Only allow http(s) URLs through into href/src — escapeHtml already ran, so a javascript: URI
// couldn't execute, but there's no reason to emit one either.
function isSafeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

// Matches, in priority order, `![alt](url)`, `[text](url)`, or a bare `https://...` URL. Single
// combined regex so each stretch of text is consumed exactly once — running `linkify` as a
// separate later pass would re-match the URL sitting inside an already-built href="..."/src="..."
// and wrap it in a second, nested anchor.
const INLINE_PATTERN =
  /!\[([^[\]]*)\]\((https?:\/\/[^\s)]+)\)|\[([^[\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+[^\s<.,;:!?)"'])/g;

function renderInline(escaped: string): string {
  return escaped.replace(
    INLINE_PATTERN,
    (match, imageAlt?: string, imageUrl?: string, linkLabel?: string, linkUrl?: string, bareUrl?: string) => {
      if (imageUrl !== undefined) {
        return isSafeUrl(imageUrl)
          ? `<img src="${imageUrl}" alt="${imageAlt}" style="max-width:100%;height:auto;display:block;margin:0 0 16px;" />`
          : match;
      }
      if (linkUrl !== undefined) {
        return isSafeUrl(linkUrl) ? `<a href="${linkUrl}" style="color:#1875f0;">${linkLabel}</a>` : match;
      }
      return `<a href="${bareUrl}" style="color:#1875f0;">${bareUrl}</a>`;
    },
  );
}

export function textToEmailHtml(text: string): string {
  const paragraphs = text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;">${renderInline(escapeHtml(p)).replace(/\n/g, "<br />")}</p>`);

  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#111827;">${paragraphs.join("")}</div>`;
}
