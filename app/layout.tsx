import "./globals.css";
import { ThemeProvider } from "@/context/global-theme-context";
import { ToastProvider } from "@/context/toast-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <title>Dynamic Portfolio Builder</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Sen:wght@400..800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-portfolio-bg text-portfolio-text font-sans antialiased relative transition-colors duration-200">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}