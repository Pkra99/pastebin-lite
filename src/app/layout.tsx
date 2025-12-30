import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pastebin Lite | Share Code Snippets",
  description: "A minimal, fast pastebin for sharing code and text snippets with optional expiry and view limits.",
  keywords: ["pastebin", "code sharing", "snippets", "text sharing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
