import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username")?.trim();
    const displayName = searchParams.get("name")?.trim();

    const displayUsername = username ? `@${username.toLowerCase()}` : "";
    const titleText = displayName || "Developer Profile";

    // ── ROCK SOLID LOCAL FILE FETCH ──
    // Grabs the local binary asset safely from your repository framework setup
    const fontData = await fetch(
      new URL("/fonts/sen/Sen-Bold.ttf", req.url)
    ).then((res) => {
      if (!res.ok) throw new Error("Failed to load local Sen-Bold font from public folder");
      return res.arrayBuffer();
    });

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#030303",
            // Matte structural background grid layout
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            position: "relative",
            fontFamily: "Sen",
            padding: "90px 100px",
          }}
        >
          {/* Ambient Backdrop Green Blur Bloom */}
          <div
            style={{
              position: "absolute",
              top: "25%",
              left: "45%",
              width: "650px",
              height: "450px",
              background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0) 70%)",
              filter: "blur(50px)",
              borderRadius: "50%",
            }}
          />

          {/* Context Network Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
            <span style={{ fontSize: "24px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              Stackfold
            </span>
            <span style={{ fontSize: "24px", color: "rgba(255, 255, 255, 0.2)" }}>/</span>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", letterSpacing: "-0.01em", marginTop: "3px" }}>
              Developer Network
            </span>
          </div>

          {/* Core Content: Dynamic User Focus Block */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", position: "relative", maxWidth: "950px", marginBottom: "auto", marginTop: "auto" }}>
            {displayUsername && (
              <span style={{ fontSize: "24px", fontWeight: 700, color: "#10b981", letterSpacing: "0.02em", marginBottom: "16px", backgroundColor: "rgba(16, 185, 129, 0.06)", padding: "4px 12px", borderRadius: "6px", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
                {displayUsername}
              </span>
            )}
            <h1 style={{ fontSize: "72px", fontWeight: 700, letterSpacing: "-0.04em", color: "#FFFFFF", margin: "0", lineHeight: 1.1 }}>
              {titleText}
            </h1>
          </div>

          {/* Context Footer Identity Footprint */}
          <div style={{ display: "flex", width: "100%", position: "relative", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "32px" }}>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", letterSpacing: "-0.01em" }}>
              Verified Creator Portfolio • Powered by Stackfold Engine
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Sen",
            data: fontData,
            style: "normal",
            weight: 700, // Explicitly binds the loaded bold file weight to the styling layout
          },
        ],
      }
    );
  } catch (error) {
    console.error("OG Image generation engine crash details:", error);
    return new Response(`Failed to generate portfolio preview asset canvas`, { status: 500 });
  }
}