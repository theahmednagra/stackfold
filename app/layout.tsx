import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-black font-sans text-zinc-100 antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 right-0 h-120 w-120 rounded-full bg-emerald-500/10 blur-[140px]" />
        </div>
        {children}
      </body>
    </html>
  );
}
