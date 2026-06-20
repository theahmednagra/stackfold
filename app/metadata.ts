import type { Metadata, Viewport } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stackfold.com";

// ================= PRODUCTION SEO METADATA ARCHITECTURE =================
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl), 
  title: {
    default: "Dynamic Portfolio Builder | Stackfold",
    template: "%s | Stackfold", 
  },
  description: "The premier elite platform for developers to build, monitor, and scale professional, high-performance portfolio showcase systems with absolute speed.",
  keywords: ["portfolio builder", "developer portfolio", "nextjs portfolio", "saas architecture", "software engineer showcase"],
  authors: [{ name: "Stackfold Team" }],
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: "Dynamic Portfolio Builder | Stackfold",
    description: "Build a portfolio that commands attention. The minimalist developer showcase platform.",
    url: baseUrl,
    siteName: "Stackfold",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-default.png", 
        width: 1200,
        height: 630,
        alt: "Stackfold Application Dashboard Overview Platform Canvas",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Dynamic Portfolio Builder | Stackfold",
    description: "The premier minimalist developer showcase platform.",
    images: ["/og-default.png"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
};

// ================= SEPARATE VIEWPORT CONFIGURATIONS =================
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030303", 
};
