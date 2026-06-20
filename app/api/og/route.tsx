import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username")?.trim();
    const displayName = searchParams.get("name")?.trim();

    const displayUsername = username ? `@${username.toLowerCase()}` : "Developer";
    const titleText = displayName || "Portfolio Space";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#030303",
            position: "relative",
            fontFamily: "sans-serif",
            padding: "0 60px",
          }}
        >
          {/* Subtle Ambient Radial Backglow Grid Effect */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "600px",
              height: "400px",
              background: "rgba(168, 85, 247, 0.04)", // Maps to a soft portfolio accent hex
              filter: "blur(120px)",
              borderRadius: "50%",
            }}
          />

          {/* Core Content Box Layout */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Minimalist Wireframe Code Framework Icon Asset */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "32px",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            </div>

            {/* Dynamic Card Typography Stack */}
            <h1
              style={{
                fontSize: "52px",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: "#FFFFFF",
                margin: "0 0 16px 0",
              }}
            >
              {titleText}
            </h1>

            <p
              style={{
                fontSize: "24px",
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.5)",
                margin: "0 0 56px 0",
                letterSpacing: "-0.02em",
              }}
            >
              The production workspace hub engineered by {displayUsername}
            </p>

            {/* Bottom Mini Branding Footer Flag */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 18px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "rgba(255, 255, 255, 0.3)",
                }}
              >
                Powered by Stackfold
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    return new Response(`Failed to generate portfolio preview asset canvas`, { status: 500 });
  }
}
