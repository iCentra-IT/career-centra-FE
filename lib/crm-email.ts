// Turns what a marketer types (plain English, blank line between paragraphs) into the HTML body the
// campaign API expects. Escapes everything first, so typed text can never inject markup.

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function linkify(escaped: string): string {
  return escaped.replace(
    /(https?:\/\/[^\s<]+[^\s<.,;:!?)"'])/g,
    (url) => `<a href="${url}" style="color:#1875f0;">${url}</a>`,
  );
}

export function textToEmailHtml(text: string): string {
  const paragraphs = text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;">${linkify(escapeHtml(p)).replace(/\n/g, "<br />")}</p>`);

  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#111827;">${paragraphs.join("")}</div>`;
}
