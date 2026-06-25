import { Sen } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/global-theme-context";
import { ToastProvider } from "@/context/toast-context";

// 🎯 Re-export metadata and viewport directly so Next.js intercepts them safely
export { metadata, viewport } from "./metadata";

const senFont = Sen({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sen",
  display: "swap",
  preload: true,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scrollbar-none">
      <head>
        <meta name="google-site-verification" content="3Gip6lWNazPzAzN1lthsOgNtthQdE8UFOiSruOiqvRg" />
      </head>
      <body
        className={`${senFont.className} ${senFont.variable} custom-scrollbar min-h-full bg-portfolio-bg text-portfolio-text antialiased relative transition-colors duration-200`}
      >
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
