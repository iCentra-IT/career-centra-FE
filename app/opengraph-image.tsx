import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "CareerCentra — Career Advancement Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social-share image for any page that doesn't set its own (blog posts/programs use their
// own cover_image_url instead — see generateMetadata in those routes). Just the brand logo on a
// plain background, nothing else — Node.js runtime (not edge) so it can read the logo straight off
// disk and inline it as the <img>'s src; next/og's renderer can't fetch a relative /public path.
export default async function OpengraphImage() {
  const logoData = await readFile(join(process.cwd(), "public/CareerCentra-full-logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <img src={logoSrc} width={760} height={322} alt="CareerCentra" />
      </div>
    ),
    { ...size },
  );
}
