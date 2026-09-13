import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clarkson’s Flock",
  description: "Sheep and goat records, breeding, lambing and farm management.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {capable: true, title: "Flock", statusBarStyle: "default"},
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/app-icon-192.png",
    shortcut: "/favicon.svg",
  },
};

export const viewport = {width: "device-width", initialScale: 1, themeColor: "#234b3d"};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
