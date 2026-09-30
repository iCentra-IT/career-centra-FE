import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CareerCentra — Career Advancement Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social-share image for any page that doesn't set its own (blog posts/programs use their
// own cover_image_url instead — see generateMetadata in those routes). Generated at request time
// from JSX rather than a static asset so it never drifts from the brand colors in app/globals.css.
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(135deg, #0c236c 0%, #010f37 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "rgba(255,255,255,0.1)",
            marginBottom: 32,
          }}
        >
          <svg width="52" height="52" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 1.5l7.5 3v6c0 4.7-3.2 8.9-7.5 9.9-4.3-1-7.5-5.2-7.5-9.9v-6l7.5-3z"
              stroke="white"
              strokeWidth="1.3"
            />
            <circle cx="10" cy="9" r="2.6" stroke="#00dbff" strokeWidth="1.3" />
          </svg>
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "white" }}>
          CareerCentra
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#9fb3e8", marginTop: 16 }}>
          Career Advancement Platform · An iCentra Brand
        </div>
      </div>
    ),
    { ...size },
  );
}
